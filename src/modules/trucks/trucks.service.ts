import logger from "../../shared/logger";
import { NotFoundError, ConflictError, AppError } from "../../shared/AppError";
import {
  CreateTruckRequest,
  UpdateTruckRequest,
  UpdateMaintenanceRequest,
  TruckFilters,
  TruckResponse,
} from "./trucks.types";
import prisma from "../../shared/prisma";
import { Prisma } from "@prisma/client";

const mapTruckToResponse = (truck: any): TruckResponse => ({
  id: truck.id,
  engineNumber: truck.engineNumber,
  plateNumber: truck.plateNumber,
  registrationNumber: truck.registrationNumber,
  model: truck.model,
  make: truck.make,
  year: truck.year,
  color: truck.color,
  capacity: Number(truck.capacity),
  capacityUnit: truck.capacityUnit,
  registrationDate: truck.registrationDate,
  registrationExpiry: truck.registrationExpiry,
  insuranceExpiry: truck.insuranceExpiry,
  lastMaintenanceDate: truck.lastMaintenanceDate,
  maintenanceType: truck.maintenanceType,
  maintenanceDescription: truck.maintenanceDescription,
  maintenanceServiceProvider: truck.maintenanceServiceProvider,
  maintenanceCompletedDate: truck.maintenanceCompletedDate,
  nextMaintenanceDate: truck.nextMaintenanceDate,
  status: truck.status,
  active: truck.active,
  notes: truck.notes,
  officeId: truck.officeId,
  branchId: truck.branchId,
  createdAt: truck.createdAt,
  updatedAt: truck.updatedAt,
  ...(truck.office && {
    office: {
      id: truck.office.id,
      name: truck.office.name,
      code: truck.office.code,
    },
  }),
  ...(truck.branch && {
    branch: {
      id: truck.branch.id,
      name: truck.branch.name,
      code: truck.branch.code,
    },
  }),
});

export const createTruck = async (
  data: CreateTruckRequest
): Promise<TruckResponse> => {
  logger.info({ engineNumber: data.engineNumber }, "Creating new truck");

  const existingEngine = await prisma.truck.findUnique({
    where: { engineNumber: data.engineNumber },
  });
  if (existingEngine) {
    throw new ConflictError("Truck with this engine number already exists");
  }

  const existingPlate = await prisma.truck.findUnique({
    where: { plateNumber: data.plateNumber },
  });
  if (existingPlate) {
    throw new ConflictError("Truck with this plate number already exists");
  }

  const existingReg = await prisma.truck.findUnique({
    where: { registrationNumber: data.registrationNumber },
  });
  if (existingReg) {
    throw new ConflictError(
      "Truck with this registration number already exists"
    );
  }

  if (!data.officeId && !data.branchId) {
    throw new AppError(
      "Truck must be assigned to either an office or a branch",
      400
    );
  }

  if (data.officeId) {
    const office = await prisma.office.findUnique({
      where: { id: data.officeId },
    });
    if (!office) {
      throw new NotFoundError("Office not found");
    }
  }

  if (data.branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch) {
      throw new NotFoundError("Branch not found");
    }
  }

  const truck = await prisma.truck.create({
    data: {
      engineNumber: data.engineNumber,
      plateNumber: data.plateNumber,
      registrationNumber: data.registrationNumber,
      model: data.model || null,
      make: data.make || null,
      year: data.year || null,
      color: data.color || null,
      capacity: data.capacity,
      capacityUnit: data.capacityUnit || "m3",
      registrationDate: data.registrationDate
        ? new Date(data.registrationDate)
        : null,
      registrationExpiry: data.registrationExpiry
        ? new Date(data.registrationExpiry)
        : null,
      insuranceExpiry: data.insuranceExpiry
        ? new Date(data.insuranceExpiry)
        : null,
      status: "AVAILABLE",
      active: true,
      notes: data.notes || null,
      officeId: data.officeId || null,
      branchId: data.branchId || null,
    },
    include: {
      office: true,
      branch: true,
    },
  });

  logger.info({ truckId: truck.id }, "Truck created successfully");
  return mapTruckToResponse(truck);
};

export const getAllTrucks = async (
  filters: TruckFilters
): Promise<TruckResponse[]> => {
  logger.info({ filters }, "Fetching all trucks");

  const where: Prisma.TruckWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  if (filters.officeId) {
    where.officeId = filters.officeId;
  }

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }

  if (filters.make) {
    where.make = filters.make;
  }

  const trucks = await prisma.truck.findMany({
    where,
    include: {
      office: true,
      branch: true,
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info({ count: trucks.length }, "Trucks fetched successfully");
  return trucks.map(mapTruckToResponse);
};

export const getTruckById = async (truckId: number): Promise<TruckResponse> => {
  logger.info({ truckId }, "Fetching truck by ID");

  const truck = await prisma.truck.findUnique({
    where: { id: truckId },
    include: {
      office: true,
      branch: true,
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!truck) {
    logger.warn({ truckId }, "Truck not found");
    throw new NotFoundError("Truck not found");
  }

  logger.info({ truckId }, "Truck fetched successfully");
  return mapTruckToResponse(truck);
};

export const updateTruck = async (
  truckId: number,
  data: UpdateTruckRequest
): Promise<TruckResponse> => {
  logger.info({ truckId, updates: Object.keys(data) }, "Updating truck");

  const existingTruck = await prisma.truck.findUnique({
    where: { id: truckId },
  });

  if (!existingTruck) {
    throw new NotFoundError("Truck not found");
  }

  if (data.engineNumber && data.engineNumber !== existingTruck.engineNumber) {
    const exists = await prisma.truck.findUnique({
      where: { engineNumber: data.engineNumber },
    });
    if (exists) {
      throw new ConflictError("Truck with this engine number already exists");
    }
  }

  if (data.plateNumber && data.plateNumber !== existingTruck.plateNumber) {
    const exists = await prisma.truck.findUnique({
      where: { plateNumber: data.plateNumber },
    });
    if (exists) {
      throw new ConflictError("Truck with this plate number already exists");
    }
  }

  if (
    data.registrationNumber &&
    data.registrationNumber !== existingTruck.registrationNumber
  ) {
    const exists = await prisma.truck.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });
    if (exists) {
      throw new ConflictError(
        "Truck with this registration number already exists"
      );
    }
  }

  if (data.officeId) {
    const office = await prisma.office.findUnique({
      where: { id: data.officeId },
    });
    if (!office) {
      throw new NotFoundError("Office not found");
    }
  }

  if (data.branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch) {
      throw new NotFoundError("Branch not found");
    }
  }

  const updateData: Prisma.TruckUpdateInput = {};

  if (data.engineNumber) updateData.engineNumber = data.engineNumber;
  if (data.plateNumber) updateData.plateNumber = data.plateNumber;
  if (data.registrationNumber)
    updateData.registrationNumber = data.registrationNumber;
  if (data.model !== undefined) updateData.model = data.model || null;
  if (data.make !== undefined) updateData.make = data.make || null;
  if (data.year !== undefined) updateData.year = data.year || null;
  if (data.color !== undefined) updateData.color = data.color || null;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.capacityUnit) updateData.capacityUnit = data.capacityUnit;
  if (data.registrationDate !== undefined)
    updateData.registrationDate = data.registrationDate
      ? new Date(data.registrationDate)
      : null;
  if (data.registrationExpiry !== undefined)
    updateData.registrationExpiry = data.registrationExpiry
      ? new Date(data.registrationExpiry)
      : null;
  if (data.insuranceExpiry !== undefined)
    updateData.insuranceExpiry = data.insuranceExpiry
      ? new Date(data.insuranceExpiry)
      : null;
  if (data.status) updateData.status = data.status;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.officeId !== undefined) {
    updateData.office = data.officeId
      ? { connect: { id: data.officeId } }
      : { disconnect: true };
  }
  if (data.branchId !== undefined) {
    updateData.branch = data.branchId
      ? { connect: { id: data.branchId } }
      : { disconnect: true };
  }

  const truck = await prisma.truck.update({
    where: { id: truckId },
    data: updateData,
    include: {
      office: true,
      branch: true,
    },
  });

  logger.info({ truckId }, "Truck updated successfully");
  return mapTruckToResponse(truck);
};

export const updateTruckMaintenance = async (
  truckId: number,
  data: UpdateMaintenanceRequest
): Promise<TruckResponse> => {
  logger.info({ truckId }, "Updating truck maintenance");

  const truck = await prisma.truck.findUnique({
    where: { id: truckId },
  });

  if (!truck) {
    throw new NotFoundError("Truck not found");
  }

  const updated = await prisma.truck.update({
    where: { id: truckId },
    data: {
      lastMaintenanceDate: new Date(data.lastMaintenanceDate),
      maintenanceType: data.maintenanceType,
      maintenanceDescription: data.maintenanceDescription || null,
      maintenanceServiceProvider: data.maintenanceServiceProvider || null,
      maintenanceCompletedDate: data.maintenanceCompletedDate
        ? new Date(data.maintenanceCompletedDate)
        : null,
      nextMaintenanceDate: data.nextMaintenanceDate
        ? new Date(data.nextMaintenanceDate)
        : null,
    },
    include: {
      office: true,
      branch: true,
    },
  });

  logger.info({ truckId }, "Truck maintenance updated successfully");
  return mapTruckToResponse(updated);
};

export const deleteTruck = async (truckId: number): Promise<void> => {
  logger.info({ truckId }, "Deleting truck");

  const truck = await prisma.truck.findUnique({
    where: { id: truckId },
    include: {
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!truck) {
    throw new NotFoundError("Truck not found");
  }

  if (truck._count.deliveries > 0) {
    throw new ConflictError(
      "Cannot delete truck with existing deliveries. Please remove or reassign deliveries first."
    );
  }

  await prisma.truck.delete({
    where: { id: truckId },
  });

  logger.info({ truckId }, "Truck deleted successfully");
};

export const getTruckDeliveries = async (truckId: number) => {
  logger.info({ truckId }, "Fetching deliveries for truck");

  const truck = await prisma.truck.findUnique({
    where: { id: truckId },
  });

  if (!truck) {
    logger.warn({ truckId }, "Truck not found");
    throw new NotFoundError("Truck not found");
  }

  const deliveries = await prisma.delivery.findMany({
    where: { truckId },
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

  logger.info({ truckId, count: deliveries.length }, "Truck deliveries fetched successfully");
  return deliveries;
};
