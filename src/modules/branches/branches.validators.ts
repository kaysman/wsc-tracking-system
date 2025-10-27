import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/AppError";

export const validateCreateBranch = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { name, code, officeId, city, latitude, longitude } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string");
  }

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    errors.push("code is required and must be a non-empty string");
  }

  if (!officeId || typeof officeId !== "number") {
    errors.push("officeId is required and must be a number");
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

  // Optional string fields validation
  if (req.body.phone && typeof req.body.phone !== "string") {
    errors.push("phone must be a string");
  }

  if (req.body.email && typeof req.body.email !== "string") {
    errors.push("email must be a string");
  }

  if (req.body.description && typeof req.body.description !== "string") {
    errors.push("description must be a string");
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

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateUpdateBranch = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  if (req.body.name !== undefined) {
    if (
      typeof req.body.name !== "string" ||
      req.body.name.trim().length === 0
    ) {
      errors.push("name must be a non-empty string");
    }
  }

  if (req.body.code !== undefined) {
    if (
      typeof req.body.code !== "string" ||
      req.body.code.trim().length === 0
    ) {
      errors.push("code must be a non-empty string");
    }
  }

  if (
    req.body.officeId !== undefined &&
    typeof req.body.officeId !== "number"
  ) {
    errors.push("officeId must be a number");
  }

  if (req.body.phone !== undefined && typeof req.body.phone !== "string") {
    errors.push("phone must be a string");
  }

  if (req.body.email !== undefined && typeof req.body.email !== "string") {
    errors.push("email must be a string");
  }

  if (
    req.body.description !== undefined &&
    typeof req.body.description !== "string"
  ) {
    errors.push("description must be a string");
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
