import { Request, Response, NextFunction } from "express";
import * as deliveriesService from "./deliveries.service";
import logger from "../../shared/logger";

export const createDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const delivery = await deliveriesService.createDelivery(req.body);

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: { delivery },
    });
  } catch (error) {
    logger.error({ error }, "Create delivery error");
    next(error);
  }
};

export const getAllDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as any,
      priority: req.query.priority as any,
      deliveryPlaceId: req.query.deliveryPlaceId ? parseInt(req.query.deliveryPlaceId as string, 10) : undefined,
      truckId: req.query.truckId ? parseInt(req.query.truckId as string, 10) : undefined,
      scheduledDateFrom: req.query.scheduledDateFrom as string | undefined,
      scheduledDateTo: req.query.scheduledDateTo as string | undefined,
    };

    const deliveries = await deliveriesService.getAllDeliveries(filters);

    res.status(200).json({
      success: true,
      message: "Deliveries retrieved successfully",
      data: { deliveries },
    });
  } catch (error) {
    logger.error({ error }, "Get all deliveries error");
    next(error);
  }
};

export const getDeliveryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryId = parseInt(req.params.id, 10);
    const delivery = await deliveriesService.getDeliveryById(deliveryId);

    res.status(200).json({
      success: true,
      message: "Delivery retrieved successfully",
      data: { delivery },
    });
  } catch (error) {
    logger.error({ error }, "Get delivery by ID error");
    next(error);
  }
};

export const updateDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryId = parseInt(req.params.id, 10);
    const delivery = await deliveriesService.updateDelivery(deliveryId, req.body);

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      data: { delivery },
    });
  } catch (error) {
    logger.error({ error }, "Update delivery error");
    next(error);
  }
};

export const deleteDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deliveryId = parseInt(req.params.id, 10);
    await deliveriesService.deleteDelivery(deliveryId);

    res.status(200).json({
      success: true,
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    logger.error({ error }, "Delete delivery error");
    next(error);
  }
};
