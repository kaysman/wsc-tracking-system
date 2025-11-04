import logger from "../../shared/logger.js";
import {
  ConflictError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
} from "../../shared/AppError.js";
import prisma from "../../shared/prisma.js";
import { PERMISSIONS, isValidPermission } from "../../shared/permissions.js";

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
}

export const createRole = async (data: CreateRoleData, createdBy: number) => {
  const invalidPermissions = data.permissions.filter(
    (p) => !isValidPermission(p)
  );
  if (invalidPermissions.length > 0) {
    throw new ValidationError(
      "Invalid permissions",
      invalidPermissions.map((p) => `Permission "${p}" does not exist`)
    );
  }

  const existingRole = await prisma.role.findFirst({
    where: {
      name: data.name,
      deletedAt: null,
    },
  });

  if (existingRole) {
    throw new ConflictError("Role with this name already exists");
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      isSystem: data.isSystem || false,
      active: true,
    },
  });

  logger.info({ roleId: role.id, createdBy }, "Role created");

  return role;
};

export const getRoleById = async (id: number) => {
  const role = await prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  return role;
};

export const getAllRoles = async (activeOnly: boolean = false) => {
  const roles = await prisma.role.findMany({
    where: {
      deletedAt: null,
      ...(activeOnly && { active: true }),
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return roles;
};

export const updateRole = async (
  id: number,
  data: UpdateRoleData,
  updatedBy: number
) => {
  const role = await prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem) {
    throw new ForbiddenError("Cannot modify system roles");
  }

  if (data.permissions) {
    const invalidPermissions = data.permissions.filter(
      (p) => !isValidPermission(p)
    );
    if (invalidPermissions.length > 0) {
      throw new ValidationError(
        "Invalid permissions",
        invalidPermissions.map((p) => `Permission "${p}" does not exist`)
      );
    }
  }

  if (data.name && data.name !== role.name) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        id: { not: id },
        deletedAt: null,
      },
    });

    if (existingRole) {
      throw new ConflictError("Role with this name already exists");
    }
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  logger.info({ roleId: id, updatedBy }, "Role updated");

  return updatedRole;
};

export const softDeleteRole = async (id: number, deletedBy: number) => {
  const role = await prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem) {
    throw new ForbiddenError("Cannot delete system roles");
  }

  if (role._count.users > 0) {
    throw new ForbiddenError(
      `Cannot delete role. ${role._count.users} user(s) are assigned to this role`
    );
  }

  await prisma.role.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
      active: false,
    },
  });

  logger.info({ roleId: id, deletedBy }, "Role soft deleted");

  return { message: "Role deleted successfully" };
};

export const assignPermissions = async (
  roleId: number,
  permissions: string[],
  assignedBy: number
) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
    },
  });

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  if (role.isSystem) {
    throw new ForbiddenError("Cannot modify permissions of system roles");
  }

  const invalidPermissions = permissions.filter((p) => !isValidPermission(p));
  if (invalidPermissions.length > 0) {
    throw new ValidationError(
      "Invalid permissions",
      invalidPermissions.map((p) => `Permission "${p}" does not exist`)
    );
  }

  await prisma.role.update({
    where: { id: roleId },
    data: {
      permissions,
      updatedAt: new Date(),
    },
  });

  logger.info(
    { roleId, assignedBy, permissionsCount: permissions.length },
    "Permissions assigned to role"
  );

  return { message: "Permissions assigned successfully", permissions };
};

export const getAvailablePermissions = () => {
  return Object.entries(PERMISSIONS).map(([key, value]) => ({
    key,
    value,
  }));
};
