import { Request, Response, NextFunction } from "express";
import logger from "../shared/logger";
import { AppError, ValidationError } from "../shared/AppError";
import { env } from "../shared/env.config";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = err.message || "Internal server error";
  let errors: string[] | undefined;
  let code: string | undefined;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;

    if (err instanceof ValidationError && err.errors) {
      errors = err.errors;
    }
  }

  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    switch (prismaErr.code) {
      case "P2002":
        statusCode = 409;
        message = "A record with this value already exists";
        code = "DUPLICATE_RECORD";
        break;
      case "P2025":
        statusCode = 404;
        message = "Record not found";
        code = "NOT_FOUND";
        break;
      case "P2003":
        statusCode = 400;
        message = "Foreign key constraint failed";
        code = "CONSTRAINT_FAILED";
        break;
      default:
        statusCode = 500;
        message = "Database error occurred";
        code = "DATABASE_ERROR";
    }
  } else if (err.constructor.name === "PrismaClientValidationError") {
    statusCode = 400;
    message = "Invalid data provided";
    code = "VALIDATION_ERROR";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  logger.error(
    {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
      code,
    },
    "Error occurred"
  );

  const errorResponse: Record<string, any> = {
    success: false,
    message,
  };

  if (code) {
    errorResponse.code = code;
  }

  if (errors) {
    errorResponse.errors = errors;
  }

  if (env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
};
