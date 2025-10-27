import { Request, Response, NextFunction } from "express";
import * as deliveryPlacesService from "./deliveryPlaces.service";
import logger from "../../shared/logger";

export const createDeliveryPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryPlace = await deliveryPlacesService.createDeliveryPlace(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Delivery place created successfully",
      data: { deliveryPlace },
    });
  } catch (error) {
    logger.error({ error }, "Create delivery place error");
    next(error);
  }
};

export const getAllDeliveryPlaces = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      active:
        req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined,
      city: req.query.city as string | undefined,
      region: req.query.region as string | undefined,
      search: req.query.search as string | undefined,
    };

    const deliveryPlaces = await deliveryPlacesService.getAllDeliveryPlaces(
      filters
    );

    res.status(200).json({
      success: true,
      message: "Delivery places retrieved successfully",
      data: { deliveryPlaces },
    });
  } catch (error) {
    logger.error({ error }, "Get all delivery places error");
    next(error);
  }
};

export const getDeliveryPlaceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryPlaceId = parseInt(req.params.id, 10);
    const deliveryPlace = await deliveryPlacesService.getDeliveryPlaceById(
      deliveryPlaceId
    );

    res.status(200).json({
      success: true,
      message: "Delivery place retrieved successfully",
      data: { deliveryPlace },
    });
  } catch (error) {
    logger.error({ error }, "Get delivery place by ID error");
    next(error);
  }
};

export const updateDeliveryPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryPlaceId = parseInt(req.params.id, 10);
    const deliveryPlace = await deliveryPlacesService.updateDeliveryPlace(
      deliveryPlaceId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Delivery place updated successfully",
      data: { deliveryPlace },
    });
  } catch (error) {
    logger.error({ error }, "Update delivery place error");
    next(error);
  }
};

export const deleteDeliveryPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryPlaceId = parseInt(req.params.id, 10);
    await deliveryPlacesService.deleteDeliveryPlace(deliveryPlaceId);

    res.status(200).json({
      success: true,
      message: "Delivery place deleted successfully",
    });
  } catch (error) {
    logger.error({ error }, "Delete delivery place error");
    next(error);
  }
};
