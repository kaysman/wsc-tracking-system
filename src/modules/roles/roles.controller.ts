import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../../shared/types/common";
import * as rolesService from "./roles.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUser = req.user as JWTPayload;
    const role = await rolesService.createRole(req.body, currentUser.userId);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const role = await rolesService.getRoleById(roleId);

    res.status(200).json({
      success: true,
      data: role,
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
    const { activeOnly } = req.query;
    const roles = await rolesService.getAllRoles(activeOnly === "true");

    res.status(200).json({
      success: true,
      data: roles,
      count: roles.length,
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
    const roleId = Number(req.params.id);
    const currentUser = req.user as JWTPayload;
    const role = await rolesService.updateRole(
      roleId,
      req.body,
      currentUser.userId
    );

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
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
    const roleId = Number(req.params.id);
    const currentUser = req.user as JWTPayload;
    const result = await rolesService.softDeleteRole(
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

export const assignPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const { permissions } = req.body;
    const currentUser = req.user as JWTPayload;

    const result = await rolesService.assignPermissions(
      roleId,
      permissions,
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

export const getAvailablePermissions = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = rolesService.getAvailablePermissions();

    res.status(200).json({
      success: true,
      data: permissions,
      count: permissions.length,
    });
  } catch (error) {
    next(error);
  }
};
