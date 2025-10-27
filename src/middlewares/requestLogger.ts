import type { NextFunction, Request, Response } from "express";
import logger from "../shared/logger";

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  logger.info(
    {
      method: req.method,
      url: req.originalUrl ?? req.url,
      ip: req.ip,
    },
    "Incoming request"
  );
  next();
};
