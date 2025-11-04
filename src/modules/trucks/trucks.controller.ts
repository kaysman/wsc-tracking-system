import { Request, Response, NextFunction } from "express";
import * as trucksService from "./trucks.service.js";
import logger from "../../shared/logger.js";

export const createTruck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truck = await trucksService.createTruck(req.body);

    res.status(201).json({
      success: true,
      message: "Truck created successfully",
      data: { truck },
    });
  } catch (error) {
    logger.error({ error }, "Create truck error");
    next(error);
  }
};

export const getAllTrucks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = {
      status: req.query.status as any,
      active:
        req.query.active === "true"
          ? true
          : req.query.active === "false"
          ? false
          : undefined,
      officeId: req.query.officeId
        ? parseInt(req.query.officeId as string, 10)
        : undefined,
      branchId: req.query.branchId
        ? parseInt(req.query.branchId as string, 10)
        : undefined,
      make: req.query.make as string | undefined,
    };

    const trucks = await trucksService.getAllTrucks(filters);

    res.status(200).json({
      success: true,
      message: "Trucks retrieved successfully",
      data: { trucks },
    });
  } catch (error) {
    logger.error({ error }, "Get all trucks error");
    next(error);
  }
};

export const getTruckById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truckId = parseInt(req.params.id, 10);
    const truck = await trucksService.getTruckById(truckId);

    res.status(200).json({
      success: true,
      message: "Truck retrieved successfully",
      data: { truck },
    });
  } catch (error) {
    logger.error({ error }, "Get truck by ID error");
    next(error);
  }
};

export const updateTruck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truckId = parseInt(req.params.id, 10);
    const truck = await trucksService.updateTruck(truckId, req.body);

    res.status(200).json({
      success: true,
      message: "Truck updated successfully",
      data: { truck },
    });
  } catch (error) {
    logger.error({ error }, "Update truck error");
    next(error);
  }
};

export const updateTruckMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truckId = parseInt(req.params.id, 10);
    const truck = await trucksService.updateTruckMaintenance(truckId, req.body);

    res.status(200).json({
      success: true,
      message: "Truck maintenance updated successfully",
      data: { truck },
    });
  } catch (error) {
    logger.error({ error }, "Update truck maintenance error");
    next(error);
  }
};

export const deleteTruck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truckId = parseInt(req.params.id, 10);
    await trucksService.deleteTruck(truckId);

    res.status(200).json({
      success: true,
      message: "Truck deleted successfully",
    });
  } catch (error) {
    logger.error({ error }, "Delete truck error");
    next(error);
  }
};

export const getTruckDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const truckId = parseInt(req.params.id, 10);
    const deliveries = await trucksService.getTruckDeliveries(truckId);

    res.status(200).json({
      success: true,
      message: "Truck deliveries retrieved successfully",
      data: { deliveries },
    });
  } catch (error) {
    logger.error({ error }, "Get truck deliveries error");
    next(error);
  }
};
