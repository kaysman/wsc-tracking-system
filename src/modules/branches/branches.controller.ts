import { Request, Response, NextFunction } from "express";
import * as branchesService from "./branches.service.js";
import logger from "../../shared/logger.js";

export const createBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branch = await branchesService.createBranch(req.body);

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: { branch },
    });
  } catch (error) {
    logger.error({ error }, "Create branch error");
    next(error);
  }
};

export const getAllBranches = async (
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
      officeId: req.query.officeId ? parseInt(req.query.officeId as string, 10) : undefined,
      city: req.query.city as string | undefined,
      region: req.query.region as string | undefined,
    };

    const branches = await branchesService.getAllBranches(filters);

    res.status(200).json({
      success: true,
      message: "Branches retrieved successfully",
      data: { branches },
    });
  } catch (error) {
    logger.error({ error }, "Get all branches error");
    next(error);
  }
};

export const getBranchById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id, 10);
    const branch = await branchesService.getBranchById(branchId);

    res.status(200).json({
      success: true,
      message: "Branch retrieved successfully",
      data: { branch },
    });
  } catch (error) {
    logger.error({ error }, "Get branch by ID error");
    next(error);
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id, 10);
    const branch = await branchesService.updateBranch(branchId, req.body);

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: { branch },
    });
  } catch (error) {
    logger.error({ error }, "Update branch error");
    next(error);
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id, 10);
    await branchesService.deleteBranch(branchId);

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    logger.error({ error }, "Delete branch error");
    next(error);
  }
};

export const getBranchTrucks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id, 10);
    const trucks = await branchesService.getBranchTrucks(branchId);

    res.status(200).json({
      success: true,
      message: "Branch trucks retrieved successfully",
      data: { trucks },
    });
  } catch (error) {
    logger.error({ error }, "Get branch trucks error");
    next(error);
  }
};

export const getBranchDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id, 10);
    const deliveries = await branchesService.getBranchDeliveries(branchId);

    res.status(200).json({
      success: true,
      message: "Branch deliveries retrieved successfully",
      data: { deliveries },
    });
  } catch (error) {
    logger.error({ error }, "Get branch deliveries error");
    next(error);
  }
};
