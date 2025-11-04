import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/AppError.js";

export const validateCreateDeliveryPlace = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { placeName, receiverName, city, latitude, longitude } = req.body;

  if (
    !placeName ||
    typeof placeName !== "string" ||
    placeName.trim().length === 0
  ) {
    errors.push("placeName is required and must be a non-empty string");
  }

  if (
    !receiverName ||
    typeof receiverName !== "string" ||
    receiverName.trim().length === 0
  ) {
    errors.push("receiverName is required and must be a non-empty string");
  }

  if (!city || typeof city !== "string" || city.trim().length === 0) {
    errors.push("city is required and must be a non-empty string");
  }

  if (latitude === undefined || typeof latitude !== "number") {
    errors.push("latitude is required and must be a number");
  } else if (latitude < -90 || latitude > 90) {
    errors.push("latitude must be between -90 and 90");
  }

  if (longitude === undefined || typeof longitude !== "number") {
    errors.push("longitude is required and must be a number");
  } else if (longitude < -180 || longitude > 180) {
    errors.push("longitude must be between -180 and 180");
  }

  if (req.body.receiverPhone && typeof req.body.receiverPhone !== "string") {
    errors.push("receiverPhone must be a string");
  }

  if (req.body.street && typeof req.body.street !== "string") {
    errors.push("street must be a string");
  }

  if (req.body.district && typeof req.body.district !== "string") {
    errors.push("district must be a string");
  }

  if (req.body.region && typeof req.body.region !== "string") {
    errors.push("region must be a string");
  }

  if (req.body.postalCode && typeof req.body.postalCode !== "string") {
    errors.push("postalCode must be a string");
  }

  if (req.body.addressNotes && typeof req.body.addressNotes !== "string") {
    errors.push("addressNotes must be a string");
  }

  if (req.body.notes && typeof req.body.notes !== "string") {
    errors.push("notes must be a string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateUpdateDeliveryPlace = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  if (req.body.placeName !== undefined) {
    if (
      typeof req.body.placeName !== "string" ||
      req.body.placeName.trim().length === 0
    ) {
      errors.push("placeName must be a non-empty string");
    }
  }

  if (req.body.receiverName !== undefined) {
    if (
      typeof req.body.receiverName !== "string" ||
      req.body.receiverName.trim().length === 0
    ) {
      errors.push("receiverName must be a non-empty string");
    }
  }

  if (
    req.body.receiverPhone !== undefined &&
    typeof req.body.receiverPhone !== "string"
  ) {
    errors.push("receiverPhone must be a string");
  }

  if (req.body.active !== undefined && typeof req.body.active !== "boolean") {
    errors.push("active must be a boolean");
  }

  if (req.body.city !== undefined) {
    if (
      typeof req.body.city !== "string" ||
      req.body.city.trim().length === 0
    ) {
      errors.push("city must be a non-empty string");
    }
  }

  if (req.body.latitude !== undefined) {
    if (typeof req.body.latitude !== "number") {
      errors.push("latitude must be a number");
    } else if (req.body.latitude < -90 || req.body.latitude > 90) {
      errors.push("latitude must be between -90 and 90");
    }
  }

  if (req.body.longitude !== undefined) {
    if (typeof req.body.longitude !== "number") {
      errors.push("longitude must be a number");
    } else if (req.body.longitude < -180 || req.body.longitude > 180) {
      errors.push("longitude must be between -180 and 180");
    }
  }

  // Optional string fields
  const stringFields = [
    "street",
    "district",
    "region",
    "postalCode",
    "addressNotes",
    "notes",
  ];
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
