import logger from "../../shared/logger";
import { NotFoundError, ConflictError } from "../../shared/AppError";
import {
  CreateDeliveryRequest,
  UpdateDeliveryRequest,
  DeliveryFilters,
  DeliveryResponse,
} from "./deliveries.types";
import prisma from "../../shared/prisma";
import { Prisma } from "@prisma/client";

const mapDeliveryToResponse = (delivery: any): DeliveryResponse => ({
  id: delivery.id,
  deliveryNumber: delivery.deliveryNumber,
  scheduledDate: delivery.scheduledDate,
  scheduledTime: delivery.scheduledTime,
  actualDate: delivery.actualDate,
  completedAt: delivery.completedAt,
  quantity: delivery.quantity ? Number(delivery.quantity) : null,
  quantityUnit: delivery.quantityUnit,
  pricePerUnit: delivery.pricePerUnit ? Number(delivery.pricePerUnit) : null,
  totalAmount: delivery.totalAmount ? Number(delivery.totalAmount) : null,
  transportFee: delivery.transportFee ? Number(delivery.transportFee) : null,
  status: delivery.status,
  priority: delivery.priority,
  distanceTraveled: delivery.distanceTraveled
    ? Number(delivery.distanceTraveled)
    : null,
  driverName: delivery.driverName,
  notes: delivery.notes,
  cancellationReason: delivery.cancellationReason,
  createdAt: delivery.createdAt,
  updatedAt: delivery.updatedAt,
  deliveryPlace: {
    id: delivery.deliveryPlace.id,
    placeName: delivery.deliveryPlace.placeName,
    receiverName: delivery.deliveryPlace.receiverName,
    receiverPhone: delivery.deliveryPlace.receiverPhone,
  },
  truck: {
    id: delivery.truck.id,
    plateNumber: delivery.truck.plateNumber,
    engineNumber: delivery.truck.engineNumber,
    model: delivery.truck.model,
    make: delivery.truck.make,
  },
});

export const createDelivery = async (
  data: CreateDeliveryRequest
): Promise<DeliveryResponse> => {
  logger.info({ deliveryNumber: data.deliveryNumber }, "Creating new delivery");

  const existingDelivery = await prisma.delivery.findUnique({
    where: { deliveryNumber: data.deliveryNumber },
  });

  if (existingDelivery) {
    logger.warn(
      { deliveryNumber: data.deliveryNumber },
      "Delivery creation failed: delivery number already exists"
    );
    throw new ConflictError(
      "Delivery with this delivery number already exists"
    );
  }

  const deliveryPlace = await prisma.deliveryPlace.findUnique({
    where: { id: data.deliveryPlaceId },
  });

  if (!deliveryPlace) {
    logger.warn(
      { deliveryPlaceId: data.deliveryPlaceId },
      "Delivery place not found"
    );
    throw new NotFoundError("Delivery place not found");
  }

  const truck = await prisma.truck.findUnique({
    where: { id: data.truckId },
  });

  if (!truck) {
    logger.warn({ truckId: data.truckId }, "Truck not found");
    throw new NotFoundError("Truck not found");
  }

  const delivery = await prisma.delivery.create({
    data: {
      deliveryNumber: data.deliveryNumber,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      scheduledTime: data.scheduledTime || null,
      quantity: data.quantity || null,
      quantityUnit: data.quantityUnit || "m3",
      pricePerUnit: data.pricePerUnit || null,
      totalAmount: data.totalAmount || null,
      transportFee: data.transportFee || null,
      status: "SCHEDULED",
      priority: data.priority || "NORMAL",
      driverName: data.driverName || null,
      notes: data.notes || null,
      deliveryPlaceId: data.deliveryPlaceId,
      truckId: data.truckId,
    },
    include: {
      deliveryPlace: true,
      truck: true,
    },
  });

  logger.info(
    { deliveryId: delivery.id, deliveryNumber: delivery.deliveryNumber },
    "Delivery created successfully"
  );

  return mapDeliveryToResponse(delivery);
};

export const getAllDeliveries = async (
  filters: DeliveryFilters
): Promise<DeliveryResponse[]> => {
  logger.info({ filters }, "Fetching all deliveries");

  const where: Prisma.DeliveryWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.deliveryPlaceId) {
    where.deliveryPlaceId = filters.deliveryPlaceId;
  }

  if (filters.truckId) {
    where.truckId = filters.truckId;
  }

  if (filters.scheduledDateFrom || filters.scheduledDateTo) {
    where.scheduledDate = {};
    if (filters.scheduledDateFrom) {
      where.scheduledDate.gte = new Date(filters.scheduledDateFrom);
    }
    if (filters.scheduledDateTo) {
      where.scheduledDate.lte = new Date(filters.scheduledDateTo);
    }
  }

  const deliveries = await prisma.delivery.findMany({
    where,
    include: {
      deliveryPlace: true,
      truck: true,
    },
    orderBy: { scheduledDate: "desc" },
  });

  logger.info({ count: deliveries.length }, "Deliveries fetched successfully");
  return deliveries.map(mapDeliveryToResponse);
};

export const getDeliveryById = async (
  deliveryId: number
): Promise<DeliveryResponse> => {
  logger.info({ deliveryId }, "Fetching delivery by ID");

  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      deliveryPlace: true,
      truck: true,
    },
  });

  if (!delivery) {
    logger.warn({ deliveryId }, "Delivery not found");
    throw new NotFoundError("Delivery not found");
  }

  logger.info({ deliveryId }, "Delivery fetched successfully");
  return mapDeliveryToResponse(delivery);
};

export const updateDelivery = async (
  deliveryId: number,
  data: UpdateDeliveryRequest
): Promise<DeliveryResponse> => {
  logger.info({ deliveryId, updates: Object.keys(data) }, "Updating delivery");

  const existingDelivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  if (!existingDelivery) {
    logger.warn({ deliveryId }, "Delivery update failed: not found");
    throw new NotFoundError("Delivery not found");
  }

  // Check for delivery number conflicts if updating
  if (
    data.deliveryNumber &&
    data.deliveryNumber !== existingDelivery.deliveryNumber
  ) {
    const numberExists = await prisma.delivery.findUnique({
      where: { deliveryNumber: data.deliveryNumber },
    });
    if (numberExists) {
      logger.warn(
        { deliveryNumber: data.deliveryNumber },
        "Delivery update failed: delivery number already exists"
      );
      throw new ConflictError(
        "Delivery with this delivery number already exists"
      );
    }
  }

  // Check if delivery place exists if updating
  if (data.deliveryPlaceId) {
    const deliveryPlace = await prisma.deliveryPlace.findUnique({
      where: { id: data.deliveryPlaceId },
    });
    if (!deliveryPlace) {
      logger.warn(
        { deliveryPlaceId: data.deliveryPlaceId },
        "Delivery place not found"
      );
      throw new NotFoundError("Delivery place not found");
    }
  }

  // Check if truck exists if updating
  if (data.truckId) {
    const truck = await prisma.truck.findUnique({
      where: { id: data.truckId },
    });
    if (!truck) {
      logger.warn({ truckId: data.truckId }, "Truck not found");
      throw new NotFoundError("Truck not found");
    }
  }

  const updateData: Prisma.DeliveryUpdateInput = {};
  if (data.deliveryNumber) updateData.deliveryNumber = data.deliveryNumber;
  if (data.scheduledDate !== undefined)
    updateData.scheduledDate = data.scheduledDate
      ? new Date(data.scheduledDate)
      : null;
  if (data.scheduledTime !== undefined)
    updateData.scheduledTime = data.scheduledTime || null;
  if (data.actualDate !== undefined)
    updateData.actualDate = data.actualDate ? new Date(data.actualDate) : null;
  if (data.completedAt !== undefined)
    updateData.completedAt = data.completedAt
      ? new Date(data.completedAt)
      : null;
  if (data.quantity !== undefined) updateData.quantity = data.quantity || null;
  if (data.quantityUnit !== undefined)
    updateData.quantityUnit = data.quantityUnit || null;
  if (data.pricePerUnit !== undefined)
    updateData.pricePerUnit = data.pricePerUnit || null;
  if (data.totalAmount !== undefined)
    updateData.totalAmount = data.totalAmount || null;
  if (data.transportFee !== undefined)
    updateData.transportFee = data.transportFee || null;
  if (data.status) updateData.status = data.status;
  if (data.priority) updateData.priority = data.priority;
  if (data.distanceTraveled !== undefined)
    updateData.distanceTraveled = data.distanceTraveled || null;
  if (data.driverName !== undefined)
    updateData.driverName = data.driverName || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.cancellationReason !== undefined)
    updateData.cancellationReason = data.cancellationReason || null;
  if (data.deliveryPlaceId) {
    updateData.deliveryPlace = { connect: { id: data.deliveryPlaceId } };
  }
  if (data.truckId) {
    updateData.truck = { connect: { id: data.truckId } };
  }

  const delivery = await prisma.delivery.update({
    where: { id: deliveryId },
    data: updateData,
    include: {
      deliveryPlace: true,
      truck: true,
    },
  });

  logger.info({ deliveryId }, "Delivery updated successfully");
  return mapDeliveryToResponse(delivery);
};

export const deleteDelivery = async (deliveryId: number): Promise<void> => {
  logger.info({ deliveryId }, "Deleting delivery");

  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) {
    logger.warn({ deliveryId }, "Delivery deletion failed: not found");
    throw new NotFoundError("Delivery not found");
  }

  await prisma.delivery.delete({
    where: { id: deliveryId },
  });

  logger.info({ deliveryId }, "Delivery deleted successfully");
};
