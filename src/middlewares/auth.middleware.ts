import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../shared/logger";
import { UnauthorizedError } from "../shared/AppError";
import { JWTPayload } from "../shared/types/common";
import { env } from "../shared/env.config";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn({ authHeader }, "AUTH: No Bearer token in header");
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      logger.warn("AUTH: Token is empty after extraction");
      throw new UnauthorizedError("No token provided");
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(
      {
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        path: req.path,
      },
      "AUTH: Authentication failed"
    );

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn({ errorName: error.name }, "AUTH: JWT verification error");
      return next(new UnauthorizedError("Invalid token"));
    }
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn({ expiredAt: error.expiredAt }, "AUTH: Token expired");
      return next(new UnauthorizedError("Token expired"));
    }

    if (error instanceof UnauthorizedError) {
      logger.warn({ message: error.message }, "AUTH: Unauthorized error");
      return next(error);
    }

    logger.warn("AUTH: Unknown error, unauthorized");
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
