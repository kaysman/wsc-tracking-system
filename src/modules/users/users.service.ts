import logger from "../../shared/logger";
import { NotFoundError, ForbiddenError } from "../../shared/AppError";
import prisma from "../../shared/prisma";

export interface UpdateUserData {
  name?: string;
  surname?: string;
  fathername?: string;
  email?: string;
  workEmail?: string;
  workPhone?: string;
  birthdate?: Date;
  position?: string;
  department?: string;
  roleId?: number;
  officeId?: number;
  branchId?: number;
}

export interface UserResponse {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  surname: string;
  fathername: string;
  phone: string;
  birthdate: Date | null;
  email: string | null;
  workEmail: string | null;
  workPhone: string | null;
  active: boolean;
  isVerified: boolean;
  lastLoginAt: Date | null;
  tokenExpiry: Date | null;
  passportNumber: string | null;
  position: string | null;
  department: string | null;
  hireDate: Date | null;
  role: {
    id: number;
    name: string;
    description: string | null;
    permissions: string[];
    isSystem: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  office: {
    id: number;
    name: string;
    code: string;
    phone: string;
    email: string | null;
    active: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  branch: {
    id: number;
    name: string;
    code: string;
    phone: string | null;
    email: string | null;
    active: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export const mapUserToResponse = (user: any): UserResponse => {
  const {
    password,
    refreshToken,
    deletedAt,
    deletedBy,
    roleId,
    officeId,
    branchId,
    createdById,
    addressId,
    ...userData
  } = user;

  return {
    ...userData,
    role: user.role,
    office: user.office,
    branch: user.branch,
  };
};

export const getUserById = async (id: number): Promise<UserResponse> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return mapUserToResponse(user);
};

export const getAllUsers = async (options?: {
  officeId?: number;
  branchId?: number;
  roleId?: number;
  active?: boolean;
}): Promise<UserResponse[]> => {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(options?.officeId && { officeId: options.officeId }),
      ...(options?.branchId && { branchId: options.branchId }),
      ...(options?.roleId && { roleId: options.roleId }),
      ...(options?.active !== undefined && { active: options.active }),
    },
    include: {
      role: true,
      office: true,
      branch: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map(mapUserToResponse);
};

export const updateUser = async (
  id: number,
  data: UpdateUserData,
  updatedBy: number
): Promise<UserResponse> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });

  logger.info({ userId: id, updatedBy }, "User updated");

  return mapUserToResponse(updatedUser);
};

export const softDeleteUser = async (id: number, deletedBy: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (id === deletedBy) {
    throw new ForbiddenError("Cannot delete your own account");
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
      active: false,
    },
  });

  logger.info({ userId: id, deletedBy }, "User soft deleted");

  return { message: "User deleted successfully" };
};

export const deactivateUser = async (id: number, deactivatedBy: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (id === deactivatedBy) {
    throw new ForbiddenError("Cannot deactivate your own account");
  }

  await prisma.user.update({
    where: { id },
    data: {
      active: false,
    },
  });

  logger.info({ userId: id, deactivatedBy }, "User deactivated");

  return { message: "User deactivated successfully" };
};

export const reactivateUser = async (id: number) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await prisma.user.update({
    where: { id },
    data: {
      active: true,
    },
  });

  logger.info({ userId: id }, "User reactivated");

  return { message: "User reactivated successfully" };
};

export const assignRole = async (
  userId: number,
  roleId: number,
  assignedBy: number
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
      active: true,
    },
  });

  if (!role) {
    throw new NotFoundError("Role not found or inactive");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      roleId,
    },
  });

  logger.info({ userId, roleId, assignedBy }, "Role assigned to user");

  return { message: "Role assigned successfully" };
};
