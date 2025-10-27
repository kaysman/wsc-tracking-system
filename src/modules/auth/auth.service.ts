import logger from "../../shared/logger";
import {
  NotFoundError,
  ConflictError,
  AppError,
  UnauthorizedError,
} from "../../shared/AppError";
import { LoginRequest, RegisterRequest } from "./auth.types";
import { hashPassword, comparePassword } from "../../shared/utils/crypto";
import {
  generateTokenPair,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "../../shared/utils/jwt.util";
import prisma from "../../shared/prisma";
import { JWTPayload } from "../../shared/types/common";
import { UserResponse, mapUserToResponse } from "../users/users.service";

const createJWTPayload = (user: any): JWTPayload => ({
  userId: user.id,
  roleId: user.roleId,
  officeId: user.officeId,
  branchId: user.branchId,
  phone: user.phone,
});

export const register = async (
  data: RegisterRequest
): Promise<{ user: UserResponse }> => {
  logger.info({ phone: data.phone }, "Registering new user");

  if (!data.officeId && !data.branchId) {
    logger.warn(
      { phone: data.phone },
      "User registration failed: missing office or branch assignment"
    );
    throw new AppError(
      "User must be assigned to either an office or a branch",
      400
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { phone: data.phone },
  });
  if (existingUser) {
    logger.warn(
      { phone: data.phone },
      "User registration failed: phone already exists"
    );
    throw new ConflictError("User with this phone number already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  let birthdate: Date | null = null;
  if (data.birthdate) {
    birthdate =
      typeof data.birthdate === "string"
        ? new Date(data.birthdate)
        : data.birthdate;
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      surname: data.surname,
      fathername: data.fathername,
      phone: data.phone,
      password: hashedPassword,
      birthdate: birthdate,
      email: data.email || null,
      workEmail: data.workEmail || null,
      workPhone: data.workPhone || null,
      roleId: data.roleId,
      officeId: data.officeId ?? null,
      branchId: data.branchId ?? null,
      active: true,
    },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });

  logger.info(
    {
      userId: user.id,
      phone: user.phone,
      officeId: data.officeId,
      branchId: data.branchId,
    },
    "User registered successfully"
  );

  return { user: mapUserToResponse(user) };
};

export const login = async (
  data: LoginRequest
): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> => {
  logger.info({ phone: data.phone }, "User login attempt");

  const user = await prisma.user.findUnique({
    where: { phone: data.phone },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });
  if (!user) {
    logger.warn({ phone: data.phone }, "Login failed: user not found");
    throw new UnauthorizedError("Invalid phone number or password");
  }

  if (!user.active) {
    logger.warn(
      { userId: user.id, phone: data.phone },
      "Login failed: user inactive"
    );
    throw new UnauthorizedError("Account is deactivated");
  }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    logger.warn(
      { userId: user.id, phone: data.phone },
      "Login failed: invalid password"
    );
    throw new UnauthorizedError("Invalid phone number or password");
  }

  const payload = createJWTPayload(user);
  const { accessToken, refreshToken } = generateTokenPair(payload);

  const tokenExpiry = getRefreshTokenExpiry();
  const now = new Date();

  // Update user with refresh token, expiry, and last login timestamp
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      tokenExpiry,
      lastLoginAt: now,
    },
  });

  logger.info(
    { userId: user.id, phone: user.phone, lastLoginAt: now },
    "User logged in successfully"
  );
  return { user: mapUserToResponse(user), accessToken, refreshToken };
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  logger.info("Refresh token request received");

  let payload: JWTPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    logger.warn("Refresh token verification failed: invalid token");
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });
  if (!user) {
    logger.warn({ userId: payload.userId }, "Refresh failed: user not found");
    throw new NotFoundError("User not found");
  }

  if (!user.active) {
    logger.warn({ userId: user.id }, "Refresh failed: user inactive");
    throw new UnauthorizedError("Account is deactivated");
  }

  if (user.refreshToken !== refreshToken) {
    logger.warn({ userId: user.id }, "Refresh failed: token mismatch");
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (user.tokenExpiry && user.tokenExpiry < new Date()) {
    logger.warn({ userId: user.id }, "Refresh failed: token expired");
    throw new UnauthorizedError("Refresh token has expired");
  }

  const newPayload = createJWTPayload(user);
  const tokens = generateTokenPair(newPayload);

  const newTokenExpiry = getRefreshTokenExpiry();
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, tokenExpiry: newTokenExpiry },
  });

  logger.info({ userId: user.id }, "Tokens refreshed successfully");
  return tokens;
};

export const logout = async (userId: number): Promise<void> => {
  logger.info({ userId }, "User logout request");
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null, tokenExpiry: null },
  });
  logger.info({ userId }, "User logged out successfully");
};

export const getUserById = async (userId: number): Promise<UserResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      office: true,
      branch: true,
    },
  });
  if (!user) return null;
  return mapUserToResponse(user);
};
