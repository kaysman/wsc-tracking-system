import { Request, Response, NextFunction } from "express";
import logger from "../../shared/logger";
import { AppError } from "../../shared/AppError";
import { UnauthorizedError, NotFoundError } from "../../shared/AppError";
import { env } from "../../shared/env.config";
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from "./auth.types";
import * as authService from "./auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: RegisterRequest = req.body;
    const result = await authService.register(data);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    logger.error({ error }, "Registration error");
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: LoginRequest = req.body;
    const result = await authService.login(data);

    if (env.NODE_ENV === "production") {
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    logger.error({ error }, "Login error");
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequest;
    const token = refreshToken || (req as any).cookies?.refreshToken;
    if (!token) {
      throw new AppError("Refresh token is required", 400);
    }
    const result = await authService.refreshAccessToken(token);

    if (env.NODE_ENV === "production") {
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    logger.error({ error }, "Refresh token error");
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }
    await authService.logout(Number(userId));

    if (env.NODE_ENV === "production") {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
    }

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    logger.error({ error }, "Logout error");
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      logger.error({ user: req.user }, "User object missing or no userId");
      throw new UnauthorizedError("User not authenticated");
    }

    logger.info({ userId }, "Fetching user profile");
    const user = await authService.getUserById(Number(userId));

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    logger.error({ error }, "Get profile error");
    next(error);
  }
};
