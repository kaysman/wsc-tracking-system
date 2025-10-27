import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/AppError";

const TRUCK_STATUS = [
  "AVAILABLE",
  "IN_USE",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
];
const MAINTENANCE_TYPES = [
  "ROUTINE_SERVICE",
  "OIL_CHANGE",
  "TIRE_REPLACEMENT",
  "BRAKE_SERVICE",
  "ENGINE_REPAIR",
  "TANK_CLEANING",
  "INSPECTION",
  "EMERGENCY_REPAIR",
  "OTHER",
];

export const validateCreateTruck = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const {
    engineNumber,
    plateNumber,
    registrationNumber,
    capacity,
    officeId,
    branchId,
  } = req.body;

  if (
    !engineNumber ||
    typeof engineNumber !== "string" ||
    engineNumber.trim().length === 0
  ) {
    errors.push("engineNumber is required and must be a non-empty string");
  }

  if (
    !plateNumber ||
    typeof plateNumber !== "string" ||
    plateNumber.trim().length === 0
  ) {
    errors.push("plateNumber is required and must be a non-empty string");
  }

  if (
    !registrationNumber ||
    typeof registrationNumber !== "string" ||
    registrationNumber.trim().length === 0
  ) {
    errors.push(
      "registrationNumber is required and must be a non-empty string"
    );
  }

  if (capacity === undefined || typeof capacity !== "number" || capacity <= 0) {
    errors.push("capacity is required and must be a positive number");
  }

  if (!officeId && !branchId) {
    errors.push("Either officeId or branchId must be provided");
  }

  if (
    officeId !== undefined &&
    (typeof officeId !== "number" || officeId <= 0)
  ) {
    errors.push("officeId must be a positive number");
  }

  if (
    branchId !== undefined &&
    (typeof branchId !== "number" || branchId <= 0)
  ) {
    errors.push("branchId must be a positive number");
  }

  if (req.body.model && typeof req.body.model !== "string") {
    errors.push("model must be a string");
  }

  if (req.body.make && typeof req.body.make !== "string") {
    errors.push("make must be a string");
  }

  if (req.body.year !== undefined) {
    if (
      typeof req.body.year !== "number" ||
      req.body.year < 1900 ||
      req.body.year > 2100
    ) {
      errors.push("year must be a number between 1900 and 2100");
    }
  }

  if (req.body.color && typeof req.body.color !== "string") {
    errors.push("color must be a string");
  }

  if (req.body.capacityUnit && typeof req.body.capacityUnit !== "string") {
    errors.push("capacityUnit must be a string");
  }

  if (req.body.notes && typeof req.body.notes !== "string") {
    errors.push("notes must be a string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateUpdateTruck = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  if (Object.keys(req.body).length === 0) {
    errors.push("At least one field must be provided for update");
  }

  if (req.body.engineNumber !== undefined) {
    if (
      typeof req.body.engineNumber !== "string" ||
      req.body.engineNumber.trim().length === 0
    ) {
      errors.push("engineNumber must be a non-empty string");
    }
  }

  if (req.body.plateNumber !== undefined) {
    if (
      typeof req.body.plateNumber !== "string" ||
      req.body.plateNumber.trim().length === 0
    ) {
      errors.push("plateNumber must be a non-empty string");
    }
  }

  if (req.body.registrationNumber !== undefined) {
    if (
      typeof req.body.registrationNumber !== "string" ||
      req.body.registrationNumber.trim().length === 0
    ) {
      errors.push("registrationNumber must be a non-empty string");
    }
  }

  if (req.body.capacity !== undefined) {
    if (typeof req.body.capacity !== "number" || req.body.capacity <= 0) {
      errors.push("capacity must be a positive number");
    }
  }

  if (req.body.year !== undefined) {
    if (
      typeof req.body.year !== "number" ||
      req.body.year < 1900 ||
      req.body.year > 2100
    ) {
      errors.push("year must be a number between 1900 and 2100");
    }
  }

  if (req.body.status !== undefined) {
    if (!TRUCK_STATUS.includes(req.body.status)) {
      errors.push(`status must be one of: ${TRUCK_STATUS.join(", ")}`);
    }
  }

  if (req.body.active !== undefined && typeof req.body.active !== "boolean") {
    errors.push("active must be a boolean");
  }

  if (req.body.officeId !== undefined) {
    if (req.body.officeId !== null && typeof req.body.officeId !== "number") {
      errors.push("officeId must be a number or null");
    }
  }

  if (req.body.branchId !== undefined) {
    if (req.body.branchId !== null && typeof req.body.branchId !== "number") {
      errors.push("branchId must be a number or null");
    }
  }

  // Optional string fields
  const stringFields = ["model", "make", "color", "capacityUnit", "notes"];
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

export const validateUpdateMaintenance = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { lastMaintenanceDate, maintenanceType } = req.body;

  if (!lastMaintenanceDate) {
    errors.push("lastMaintenanceDate is required");
  }

  if (!maintenanceType) {
    errors.push("maintenanceType is required");
  } else if (!MAINTENANCE_TYPES.includes(maintenanceType)) {
    errors.push(
      `maintenanceType must be one of: ${MAINTENANCE_TYPES.join(", ")}`
    );
  }

  if (
    req.body.maintenanceDescription &&
    typeof req.body.maintenanceDescription !== "string"
  ) {
    errors.push("maintenanceDescription must be a string");
  }

  if (
    req.body.maintenanceServiceProvider &&
    typeof req.body.maintenanceServiceProvider !== "string"
  ) {
    errors.push("maintenanceServiceProvider must be a string");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};
