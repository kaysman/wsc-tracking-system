import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../../shared/types/common.js";
import * as usersService from "./users.service.js";

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const user = await usersService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { officeId, branchId, roleId, active } = req.query;

    const users = await usersService.getAllUsers({
      officeId: officeId ? Number(officeId) : undefined,
      branchId: branchId ? Number(branchId) : undefined,
      roleId: roleId ? Number(roleId) : undefined,
      active: active === "true" ? true : active === "false" ? false : undefined,
    });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const currentUser = req.user as JWTPayload;
    const updateData = req.body;

    const user = await usersService.updateUser(
      userId,
      updateData,
      currentUser.userId
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const softDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const currentUser = req.user as JWTPayload;

    const result = await usersService.softDeleteUser(
      userId,
      currentUser.userId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const currentUser = req.user as JWTPayload;

    const result = await usersService.deactivateUser(
      userId,
      currentUser.userId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const reactivate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const result = await usersService.reactivateUser(userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const assignRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { roleId } = req.body;
    const currentUser = req.user as JWTPayload;

    const result = await usersService.assignRole(
      userId,
      roleId,
      currentUser.userId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
