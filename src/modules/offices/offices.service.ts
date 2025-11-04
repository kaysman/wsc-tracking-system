import logger from "../../shared/logger.js";
import { NotFoundError, ConflictError } from "../../shared/AppError.js";
import {
  CreateOfficeRequest,
  UpdateOfficeRequest,
  OfficeFilters,
  OfficeResponse,
} from "./offices.types.js";
import prisma from "../../shared/prisma.js";
import { Prisma } from "@prisma/client";

const mapOfficeToResponse = (office: any): OfficeResponse => ({
  id: office.id,
  name: office.name,
  code: office.code,
  phone: office.phone,
  email: office.email,
  description: office.description,
  active: office.active,
  createdAt: office.createdAt,
  updatedAt: office.updatedAt,
  address: {
    id: office.address.id,
    street: office.address.street,
    city: office.address.city,
    district: office.address.district,
    region: office.address.region,
    postalCode: office.address.postalCode,
    country: office.address.country,
    latitude: Number(office.address.latitude),
    longitude: Number(office.address.longitude),
    notes: office.address.notes,
  },
});

export const createOffice = async (
  data: CreateOfficeRequest
): Promise<OfficeResponse> => {
  logger.info({ code: data.code, name: data.name }, "Creating new office");

  const existingOffice = await prisma.office.findUnique({
    where: { code: data.code },
  });

  if (existingOffice) {
    logger.warn(
      { code: data.code },
      "Office creation failed: code already exists"
    );
    throw new ConflictError("Office with this code already exists");
  }

  const existingName = await prisma.office.findUnique({
    where: { name: data.name },
  });

  if (existingName) {
    logger.warn(
      { name: data.name },
      "Office creation failed: name already exists"
    );
    throw new ConflictError("Office with this name already exists");
  }

  const office = await prisma.office.create({
    data: {
      name: data.name,
      code: data.code,
      phone: data.phone,
      email: data.email || null,
      description: data.description || null,
      active: true,
      address: {
        create: {
          street: data.street || null,
          city: data.city,
          district: data.district || null,
          region: data.region || null,
          postalCode: data.postalCode || null,
          country: "Turkmenistan",
          latitude: data.latitude,
          longitude: data.longitude,
          notes: data.addressNotes || null,
        },
      },
    },
    include: {
      address: true,
    },
  });

  logger.info(
    { officeId: office.id, code: office.code },
    "Office created successfully"
  );

  return mapOfficeToResponse(office);
};

export const getAllOffices = async (
  filters: OfficeFilters
): Promise<OfficeResponse[]> => {
  logger.info({ filters }, "Fetching all offices");

  const where: Prisma.OfficeWhereInput = {};

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  if (filters.city || filters.region) {
    where.address = {};
    if (filters.city) {
      where.address.city = filters.city;
    }
    if (filters.region) {
      where.address.region = filters.region;
    }
  }

  const offices = await prisma.office.findMany({
    where,
    include: {
      address: true,
      _count: {
        select: {
          staff: true,
          branches: true,
          trucks: true,
        },
      },
    },
    orderBy: { code: "asc" },
  });

  logger.info({ count: offices.length }, "Offices fetched successfully");
  return offices.map(mapOfficeToResponse);
};

export const getOfficeById = async (
  officeId: number
): Promise<OfficeResponse> => {
  logger.info({ officeId }, "Fetching office by ID");

  const office = await prisma.office.findUnique({
    where: { id: officeId },
    include: {
      address: true,
      _count: {
        select: {
          staff: true,
          branches: true,
          trucks: true,
        },
      },
    },
  });

  if (!office) {
    logger.warn({ officeId }, "Office not found");
    throw new NotFoundError("Office not found");
  }

  logger.info({ officeId }, "Office fetched successfully");
  return mapOfficeToResponse(office);
};

export const updateOffice = async (
  officeId: number,
  data: UpdateOfficeRequest
): Promise<OfficeResponse> => {
  logger.info({ officeId, updates: Object.keys(data) }, "Updating office");

  const existingOffice = await prisma.office.findUnique({
    where: { id: officeId },
    include: { address: true },
  });

  if (!existingOffice) {
    logger.warn({ officeId }, "Office update failed: not found");
    throw new NotFoundError("Office not found");
  }

  if (data.code && data.code !== existingOffice.code) {
    const codeExists = await prisma.office.findUnique({
      where: { code: data.code },
    });
    if (codeExists) {
      logger.warn(
        { code: data.code },
        "Office update failed: code already exists"
      );
      throw new ConflictError("Office with this code already exists");
    }
  }

  if (data.name && data.name !== existingOffice.name) {
    const nameExists = await prisma.office.findUnique({
      where: { name: data.name },
    });
    if (nameExists) {
      logger.warn(
        { name: data.name },
        "Office update failed: name already exists"
      );
      throw new ConflictError("Office with this name already exists");
    }
  }

  const officeUpdateData: Prisma.OfficeUpdateInput = {};
  if (data.name) officeUpdateData.name = data.name;
  if (data.code) officeUpdateData.code = data.code;
  if (data.phone) officeUpdateData.phone = data.phone;
  if (data.email !== undefined) officeUpdateData.email = data.email || null;
  if (data.description !== undefined)
    officeUpdateData.description = data.description || null;
  if (data.active !== undefined) officeUpdateData.active = data.active;

  const addressUpdateData: Prisma.AddressUpdateInput = {};
  if (data.street !== undefined) addressUpdateData.street = data.street || null;
  if (data.city) addressUpdateData.city = data.city;
  if (data.district !== undefined)
    addressUpdateData.district = data.district || null;
  if (data.region !== undefined) addressUpdateData.region = data.region || null;
  if (data.postalCode !== undefined)
    addressUpdateData.postalCode = data.postalCode || null;
  if (data.latitude !== undefined) addressUpdateData.latitude = data.latitude;
  if (data.longitude !== undefined)
    addressUpdateData.longitude = data.longitude;
  if (data.addressNotes !== undefined)
    addressUpdateData.notes = data.addressNotes || null;

  const office = await prisma.office.update({
    where: { id: officeId },
    data: {
      ...officeUpdateData,
      ...(Object.keys(addressUpdateData).length > 0 && {
        address: {
          update: addressUpdateData,
        },
      }),
    },
    include: {
      address: true,
    },
  });

  logger.info({ officeId }, "Office updated successfully");
  return mapOfficeToResponse(office);
};

export const deleteOffice = async (officeId: number): Promise<void> => {
  logger.info({ officeId }, "Deleting office");

  const office = await prisma.office.findUnique({
    where: { id: officeId },
    include: {
      _count: {
        select: {
          staff: true,
          branches: true,
          trucks: true,
        },
      },
    },
  });

  if (!office) {
    logger.warn({ officeId }, "Office deletion failed: not found");
    throw new NotFoundError("Office not found");
  }

  if (office._count.staff > 0) {
    logger.warn(
      { officeId, staffCount: office._count.staff },
      "Office deletion failed: has staff members"
    );
    throw new ConflictError(
      "Cannot delete office with active staff members. Please reassign or remove staff first."
    );
  }

  if (office._count.branches > 0) {
    logger.warn(
      { officeId, branchCount: office._count.branches },
      "Office deletion failed: has branches"
    );
    throw new ConflictError(
      "Cannot delete office with branches. Please remove branches first."
    );
  }

  if (office._count.trucks > 0) {
    logger.warn(
      { officeId, truckCount: office._count.trucks },
      "Office deletion failed: has trucks"
    );
    throw new ConflictError(
      "Cannot delete office with trucks. Please reassign or remove trucks first."
    );
  }

  await prisma.office.delete({
    where: { id: officeId },
  });

  await prisma.address.delete({
    where: { id: office.addressId },
  });

  logger.info({ officeId }, "Office deleted successfully");
};

export const getOfficeTrucks = async (officeId: number) => {
  logger.info({ officeId }, "Fetching trucks for office");

  const office = await prisma.office.findUnique({
    where: { id: officeId },
  });

  if (!office) {
    logger.warn({ officeId }, "Office not found");
    throw new NotFoundError("Office not found");
  }

  const trucks = await prisma.truck.findMany({
    where: { officeId },
    include: {
      office: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
    orderBy: { plateNumber: "asc" },
  });

  logger.info(
    { officeId, count: trucks.length },
    "Office trucks fetched successfully"
  );
  return trucks;
};

export const getOfficeBranches = async (officeId: number) => {
  logger.info({ officeId }, "Fetching branches for office");

  const office = await prisma.office.findUnique({
    where: { id: officeId },
  });

  if (!office) {
    logger.warn({ officeId }, "Office not found");
    throw new NotFoundError("Office not found");
  }

  const branches = await prisma.branch.findMany({
    where: { officeId },
    include: {
      address: true,
      _count: {
        select: {
          staff: true,
          trucks: true,
        },
      },
    },
    orderBy: { code: "asc" },
  });

  logger.info(
    { officeId, count: branches.length },
    "Office branches fetched successfully"
  );
  return branches;
};

export const getOfficeDeliveries = async (officeId: number) => {
  logger.info({ officeId }, "Fetching deliveries for office");

  const office = await prisma.office.findUnique({
    where: { id: officeId },
  });

  if (!office) {
    logger.warn({ officeId }, "Office not found");
    throw new NotFoundError("Office not found");
  }

  const deliveries = await prisma.delivery.findMany({
    where: {
      truck: {
        officeId,
      },
    },
    include: {
      deliveryPlace: true,
      truck: {
        include: {
          office: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledDate: "desc" },
  });

  logger.info(
    { officeId, count: deliveries.length },
    "Office deliveries fetched successfully"
  );
  return deliveries;
};
