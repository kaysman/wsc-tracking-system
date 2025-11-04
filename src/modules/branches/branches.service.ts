import logger from "../../shared/logger.js";
import { NotFoundError, ConflictError } from "../../shared/AppError.js";
import {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchFilters,
  BranchResponse,
} from "./branches.types.js";
import prisma from "../../shared/prisma.js";
import { Prisma } from "@prisma/client";

const mapBranchToResponse = (branch: any): BranchResponse => ({
  id: branch.id,
  name: branch.name,
  code: branch.code,
  phone: branch.phone,
  email: branch.email,
  description: branch.description,
  active: branch.active,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
  officeId: branch.officeId,
  office: {
    id: branch.office.id,
    name: branch.office.name,
    code: branch.office.code,
  },
  address: {
    id: branch.address.id,
    street: branch.address.street,
    city: branch.address.city,
    district: branch.address.district,
    region: branch.address.region,
    postalCode: branch.address.postalCode,
    country: branch.address.country,
    latitude: Number(branch.address.latitude),
    longitude: Number(branch.address.longitude),
    notes: branch.address.notes,
  },
});

export const createBranch = async (
  data: CreateBranchRequest
): Promise<BranchResponse> => {
  logger.info({ code: data.code, name: data.name }, "Creating new branch");

  const office = await prisma.office.findUnique({
    where: { id: data.officeId },
  });

  if (!office) {
    logger.warn({ officeId: data.officeId }, "Office not found");
    throw new NotFoundError("Office not found");
  }

  const existingBranch = await prisma.branch.findUnique({
    where: { code: data.code },
  });

  if (existingBranch) {
    logger.warn(
      { code: data.code },
      "Branch creation failed: code already exists"
    );
    throw new ConflictError("Branch with this code already exists");
  }

  // Create address first
  const address = await prisma.address.create({
    data: {
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
  });

  const branch = await prisma.branch.create({
    data: {
      name: data.name,
      code: data.code,
      phone: data.phone || null,
      email: data.email || null,
      description: data.description || null,
      active: true,
      officeId: data.officeId,
      addressId: address.id,
    },
    include: {
      office: true,
      address: true,
    },
  });

  logger.info(
    { branchId: branch.id, code: branch.code },
    "Branch created successfully"
  );

  return mapBranchToResponse(branch);
};

export const getAllBranches = async (
  filters: BranchFilters
): Promise<BranchResponse[]> => {
  logger.info({ filters }, "Fetching all branches");

  const where: Prisma.BranchWhereInput = {};

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  if (filters.officeId) {
    where.officeId = filters.officeId;
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

  const branches = await prisma.branch.findMany({
    where,
    include: {
      office: true,
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

  logger.info({ count: branches.length }, "Branches fetched successfully");
  return branches.map(mapBranchToResponse);
};

export const getBranchById = async (
  branchId: number
): Promise<BranchResponse> => {
  logger.info({ branchId }, "Fetching branch by ID");

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      office: true,
      address: true,
      _count: {
        select: {
          staff: true,
          trucks: true,
        },
      },
    },
  });

  if (!branch) {
    logger.warn({ branchId }, "Branch not found");
    throw new NotFoundError("Branch not found");
  }

  logger.info({ branchId }, "Branch fetched successfully");
  return mapBranchToResponse(branch);
};

export const updateBranch = async (
  branchId: number,
  data: UpdateBranchRequest
): Promise<BranchResponse> => {
  logger.info({ branchId, updates: Object.keys(data) }, "Updating branch");

  const existingBranch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: { address: true, office: true },
  });

  if (!existingBranch) {
    logger.warn({ branchId }, "Branch update failed: not found");
    throw new NotFoundError("Branch not found");
  }

  if (data.code && data.code !== existingBranch.code) {
    const codeExists = await prisma.branch.findUnique({
      where: { code: data.code },
    });
    if (codeExists) {
      logger.warn(
        { code: data.code },
        "Branch update failed: code already exists"
      );
      throw new ConflictError("Branch with this code already exists");
    }
  }

  const branchUpdateData: Prisma.BranchUpdateInput = {};
  if (data.name) branchUpdateData.name = data.name;
  if (data.code) branchUpdateData.code = data.code;
  if (data.phone !== undefined) branchUpdateData.phone = data.phone || null;
  if (data.email !== undefined) branchUpdateData.email = data.email || null;
  if (data.description !== undefined)
    branchUpdateData.description = data.description || null;
  if (data.active !== undefined) branchUpdateData.active = data.active;

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

  const branch = await prisma.branch.update({
    where: { id: branchId },
    data: {
      ...branchUpdateData,
      ...(Object.keys(addressUpdateData).length > 0 && {
        address: {
          update: addressUpdateData,
        },
      }),
    },
    include: {
      office: true,
      address: true,
    },
  });

  logger.info({ branchId }, "Branch updated successfully");
  return mapBranchToResponse(branch);
};

export const deleteBranch = async (branchId: number): Promise<void> => {
  logger.info({ branchId }, "Deleting branch");

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      _count: {
        select: {
          staff: true,
          trucks: true,
        },
      },
    },
  });

  if (!branch) {
    logger.warn({ branchId }, "Branch deletion failed: not found");
    throw new NotFoundError("Branch not found");
  }

  // Check if branch has related data
  if (branch._count.staff > 0) {
    logger.warn(
      { branchId, staffCount: branch._count.staff },
      "Branch deletion failed: has staff members"
    );
    throw new ConflictError(
      "Cannot delete branch with active staff members. Please reassign or remove staff first."
    );
  }

  if (branch._count.trucks > 0) {
    logger.warn(
      { branchId, truckCount: branch._count.trucks },
      "Branch deletion failed: has trucks"
    );
    throw new ConflictError(
      "Cannot delete branch with trucks. Please reassign or remove trucks first."
    );
  }

  await prisma.branch.delete({
    where: { id: branchId },
  });

  await prisma.address.delete({
    where: { id: branch.addressId },
  });

  logger.info({ branchId }, "Branch deleted successfully");
};

export const getBranchTrucks = async (branchId: number) => {
  logger.info({ branchId }, "Fetching trucks for branch");

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    logger.warn({ branchId }, "Branch not found");
    throw new NotFoundError("Branch not found");
  }

  const trucks = await prisma.truck.findMany({
    where: { branchId },
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
    { branchId, count: trucks.length },
    "Branch trucks fetched successfully"
  );
  return trucks;
};

export const getBranchDeliveries = async (branchId: number) => {
  logger.info({ branchId }, "Fetching deliveries for branch");

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    logger.warn({ branchId }, "Branch not found");
    throw new NotFoundError("Branch not found");
  }

  const deliveries = await prisma.delivery.findMany({
    where: {
      truck: {
        branchId,
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
    { branchId, count: deliveries.length },
    "Branch deliveries fetched successfully"
  );
  return deliveries;
};
