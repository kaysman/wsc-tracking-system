import logger from "../../shared/logger";
import { NotFoundError, ConflictError } from "../../shared/AppError";
import {
  CreateDeliveryPlaceRequest,
  UpdateDeliveryPlaceRequest,
  DeliveryPlaceFilters,
  DeliveryPlaceResponse,
} from "./deliveryPlaces.types";
import prisma from "../../shared/prisma";
import { Prisma } from "@prisma/client";

const mapDeliveryPlaceToResponse = (place: any): DeliveryPlaceResponse => ({
  id: place.id,
  placeName: place.placeName,
  receiverName: place.receiverName,
  receiverPhone: place.receiverPhone,
  active: place.active,
  notes: place.notes,
  createdAt: place.createdAt,
  updatedAt: place.updatedAt,
  address: {
    id: place.address.id,
    street: place.address.street,
    city: place.address.city,
    district: place.address.district,
    region: place.address.region,
    postalCode: place.address.postalCode,
    country: place.address.country,
    latitude: Number(place.address.latitude),
    longitude: Number(place.address.longitude),
    notes: place.address.notes,
  },
});

export const createDeliveryPlace = async (
  data: CreateDeliveryPlaceRequest
): Promise<DeliveryPlaceResponse> => {
  logger.info({ placeName: data.placeName }, "Creating new delivery place");

  const deliveryPlace = await prisma.deliveryPlace.create({
    data: {
      placeName: data.placeName,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone || null,
      active: true,
      notes: data.notes || null,
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
    { deliveryPlaceId: deliveryPlace.id },
    "Delivery place created successfully"
  );

  return mapDeliveryPlaceToResponse(deliveryPlace);
};

export const getAllDeliveryPlaces = async (
  filters: DeliveryPlaceFilters
): Promise<DeliveryPlaceResponse[]> => {
  logger.info({ filters }, "Fetching all delivery places");

  const where: Prisma.DeliveryPlaceWhereInput = {};

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

  if (filters.search) {
    where.OR = [
      {
        placeName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        receiverName: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const deliveryPlaces = await prisma.deliveryPlace.findMany({
    where,
    include: {
      address: true,
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  logger.info(
    { count: deliveryPlaces.length },
    "Delivery places fetched successfully"
  );
  return deliveryPlaces.map(mapDeliveryPlaceToResponse);
};

export const getDeliveryPlaceById = async (
  deliveryPlaceId: number
): Promise<DeliveryPlaceResponse> => {
  logger.info({ deliveryPlaceId }, "Fetching delivery place by ID");

  const deliveryPlace = await prisma.deliveryPlace.findUnique({
    where: { id: deliveryPlaceId },
    include: {
      address: true,
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!deliveryPlace) {
    logger.warn({ deliveryPlaceId }, "Delivery place not found");
    throw new NotFoundError("Delivery place not found");
  }

  logger.info({ deliveryPlaceId }, "Delivery place fetched successfully");
  return mapDeliveryPlaceToResponse(deliveryPlace);
};

export const updateDeliveryPlace = async (
  deliveryPlaceId: number,
  data: UpdateDeliveryPlaceRequest
): Promise<DeliveryPlaceResponse> => {
  logger.info(
    { deliveryPlaceId, updates: Object.keys(data) },
    "Updating delivery place"
  );

  const existingPlace = await prisma.deliveryPlace.findUnique({
    where: { id: deliveryPlaceId },
    include: { address: true },
  });

  if (!existingPlace) {
    logger.warn({ deliveryPlaceId }, "Delivery place update failed: not found");
    throw new NotFoundError("Delivery place not found");
  }

  const placeUpdateData: Prisma.DeliveryPlaceUpdateInput = {};
  if (data.placeName) placeUpdateData.placeName = data.placeName;
  if (data.receiverName) placeUpdateData.receiverName = data.receiverName;
  if (data.receiverPhone !== undefined)
    placeUpdateData.receiverPhone = data.receiverPhone || null;
  if (data.active !== undefined) placeUpdateData.active = data.active;
  if (data.notes !== undefined) placeUpdateData.notes = data.notes || null;

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

  // Update delivery place and address
  const deliveryPlace = await prisma.deliveryPlace.update({
    where: { id: deliveryPlaceId },
    data: {
      ...placeUpdateData,
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

  logger.info({ deliveryPlaceId }, "Delivery place updated successfully");
  return mapDeliveryPlaceToResponse(deliveryPlace);
};

export const deleteDeliveryPlace = async (
  deliveryPlaceId: number
): Promise<void> => {
  logger.info({ deliveryPlaceId }, "Deleting delivery place");

  const deliveryPlace = await prisma.deliveryPlace.findUnique({
    where: { id: deliveryPlaceId },
    include: {
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!deliveryPlace) {
    logger.warn(
      { deliveryPlaceId },
      "Delivery place deletion failed: not found"
    );
    throw new NotFoundError("Delivery place not found");
  }

  if (deliveryPlace._count.deliveries > 0) {
    logger.warn(
      { deliveryPlaceId, deliveryCount: deliveryPlace._count.deliveries },
      "Delivery place deletion failed: has deliveries"
    );
    throw new ConflictError(
      "Cannot delete delivery place with existing deliveries. Please remove or reassign deliveries first."
    );
  }

  await prisma.deliveryPlace.delete({
    where: { id: deliveryPlaceId },
  });

  await prisma.address.delete({
    where: { id: deliveryPlace.addressId },
  });

  logger.info({ deliveryPlaceId }, "Delivery place deleted successfully");
};
