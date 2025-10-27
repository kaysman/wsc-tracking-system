import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/AppError";

const VALID_STATUSES = ["SCHEDULED", "IN_TRANSIT", "DELIVERED", "CANCELLED", "FAILED"];
const VALID_PRIORITIES = ["LOW", "NORMAL", "URGENT"];

export const validateCreateDelivery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { deliveryNumber, deliveryPlaceId, truckId } = req.body;

  // Required fields
  if (!deliveryNumber || typeof deliveryNumber !== "string" || deliveryNumber.trim().length === 0) {
    errors.push("deliveryNumber is required and must be a non-empty string");
  }

  if (!deliveryPlaceId || typeof deliveryPlaceId !== "number") {
    errors.push("deliveryPlaceId is required and must be a number");
  }

  if (!truckId || typeof truckId !== "number") {
    errors.push("truckId is required and must be a number");
  }

  // Optional fields validation
  if (req.body.scheduledDate !== undefined) {
    const date = new Date(req.body.scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push("scheduledDate must be a valid date");
    }
  }

  if (req.body.scheduledTime !== undefined && typeof req.body.scheduledTime !== "string") {
    errors.push("scheduledTime must be a string");
  }

  if (req.body.quantity !== undefined && typeof req.body.quantity !== "number") {
    errors.push("quantity must be a number");
  }

  if (req.body.quantityUnit !== undefined && typeof req.body.quantityUnit !== "string") {
    errors.push("quantityUnit must be a string");
  }

  if (req.body.pricePerUnit !== undefined && typeof req.body.pricePerUnit !== "number") {
    errors.push("pricePerUnit must be a number");
  }

  if (req.body.totalAmount !== undefined && typeof req.body.totalAmount !== "number") {
    errors.push("totalAmount must be a number");
  }

  if (req.body.transportFee !== undefined && typeof req.body.transportFee !== "number") {
    errors.push("transportFee must be a number");
  }

  if (req.body.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(req.body.priority)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
  }

  if (req.body.driverName !== undefined && typeof req.body.driverName !== "string") {
    errors.push("driverName must be a string");
  }

  if (req.body.notes !== undefined && typeof req.body.notes !== "string") {
    errors.push("notes must be a string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateUpdateDelivery = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  // At least one field should be provided
  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  // Validate types if fields are provided
  if (req.body.deliveryNumber !== undefined) {
    if (typeof req.body.deliveryNumber !== "string" || req.body.deliveryNumber.trim().length === 0) {
      errors.push("deliveryNumber must be a non-empty string");
    }
  }

  if (req.body.deliveryPlaceId !== undefined && typeof req.body.deliveryPlaceId !== "number") {
    errors.push("deliveryPlaceId must be a number");
  }

  if (req.body.truckId !== undefined && typeof req.body.truckId !== "number") {
    errors.push("truckId must be a number");
  }

  if (req.body.scheduledDate !== undefined) {
    const date = new Date(req.body.scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push("scheduledDate must be a valid date");
    }
  }

  if (req.body.actualDate !== undefined) {
    const date = new Date(req.body.actualDate);
    if (isNaN(date.getTime())) {
      errors.push("actualDate must be a valid date");
    }
  }

  if (req.body.completedAt !== undefined) {
    const date = new Date(req.body.completedAt);
    if (isNaN(date.getTime())) {
      errors.push("completedAt must be a valid date");
    }
  }

  if (req.body.status !== undefined) {
    if (!VALID_STATUSES.includes(req.body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
  }

  if (req.body.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(req.body.priority)) {
      errors.push(`priority must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
  }

  // Optional number fields
  const numberFields = ["quantity", "pricePerUnit", "totalAmount", "transportFee", "distanceTraveled"];
  for (const field of numberFields) {
    if (req.body[field] !== undefined && typeof req.body[field] !== "number") {
      errors.push(`${field} must be a number`);
    }
  }

  // Optional string fields
  const stringFields = ["scheduledTime", "quantityUnit", "driverName", "notes", "cancellationReason"];
  for (const field of stringFields) {
    if (req.body[field] !== undefined && typeof req.body[field] !== "string") {
      errors.push(`${field} must be a string`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};
