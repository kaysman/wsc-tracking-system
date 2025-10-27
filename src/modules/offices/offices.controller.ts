import { Request, Response, NextFunction } from "express";
import * as officesService from "./offices.service";
import logger from "../../shared/logger";

export const createOffice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const office = await officesService.createOffice(req.body);

    res.status(201).json({
      success: true,
      message: "Office created successfully",
      data: { office },
    });
  } catch (error) {
    logger.error({ error }, "Create office error");
    next(error);
  }
};

export const getAllOffices = async (
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
    };

    const offices = await officesService.getAllOffices(filters);

    res.status(200).json({
      success: true,
      message: "Offices retrieved successfully",
      data: { offices },
    });
  } catch (error) {
    logger.error({ error }, "Get all offices error");
    next(error);
  }
};

export const getOfficeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    const office = await officesService.getOfficeById(officeId);

    res.status(200).json({
      success: true,
      message: "Office retrieved successfully",
      data: { office },
    });
  } catch (error) {
    logger.error({ error }, "Get office by ID error");
    next(error);
  }
};

export const updateOffice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    const office = await officesService.updateOffice(officeId, req.body);

    res.status(200).json({
      success: true,
      message: "Office updated successfully",
      data: { office },
    });
  } catch (error) {
    logger.error({ error }, "Update office error");
    next(error);
  }
};

export const deleteOffice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    await officesService.deleteOffice(officeId);

    res.status(200).json({
      success: true,
      message: "Office deleted successfully",
    });
  } catch (error) {
    logger.error({ error }, "Delete office error");
    next(error);
  }
};

export const getOfficeTrucks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    const trucks = await officesService.getOfficeTrucks(officeId);

    res.status(200).json({
      success: true,
      message: "Office trucks retrieved successfully",
      data: { trucks },
    });
  } catch (error) {
    logger.error({ error }, "Get office trucks error");
    next(error);
  }
};

export const getOfficeBranches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    const branches = await officesService.getOfficeBranches(officeId);

    res.status(200).json({
      success: true,
      message: "Office branches retrieved successfully",
      data: { branches },
    });
  } catch (error) {
    logger.error({ error }, "Get office branches error");
    next(error);
  }
};

export const getOfficeDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const officeId = parseInt(req.params.id, 10);
    const deliveries = await officesService.getOfficeDeliveries(officeId);

    res.status(200).json({
      success: true,
      message: "Office deliveries retrieved successfully",
      data: { deliveries },
    });
  } catch (error) {
    logger.error({ error }, "Get office deliveries error");
    next(error);
  }
};
