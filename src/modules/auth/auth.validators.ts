import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../shared/AppError.js";

const isValidPhone = (phone: string): boolean => {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const {
    name,
    surname,
    fathername,
    phone,
    password,
    birthdate,
    roleId,
    officeId,
    branchId,
  } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  }
  if (!surname || typeof surname !== "string" || surname.trim().length === 0) {
    errors.push("Surname is required and must be a non-empty string");
  }
  if (
    !fathername ||
    typeof fathername !== "string" ||
    fathername.trim().length === 0
  ) {
    errors.push("Father name is required and must be a non-empty string");
  }
  if (!phone || typeof phone !== "string") {
    errors.push("Phone is required");
  } else if (!isValidPhone(phone)) {
    errors.push("Phone number format is invalid");
  }
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (!isValidPassword(password)) {
    errors.push("Password must be at least 8 characters long");
  }

  if (
    birthdate &&
    !(birthdate instanceof Date) &&
    isNaN(Date.parse(birthdate))
  ) {
    errors.push("Birthdate must be a valid date");
  }
  if (
    roleId !== undefined &&
    (!Number.isInteger(Number(roleId)) || Number(roleId) <= 0)
  ) {
    errors.push("Role ID must be a positive integer");
  }
  if (
    officeId !== undefined &&
    (!Number.isInteger(Number(officeId)) || Number(officeId) <= 0)
  ) {
    errors.push("Office ID must be a positive integer");
  }
  if (
    branchId !== undefined &&
    (!Number.isInteger(Number(branchId)) || Number(branchId) <= 0)
  ) {
    errors.push("Branch ID must be a positive integer");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { phone, password } = req.body;

  if (!phone || typeof phone !== "string") {
    errors.push("Phone is required");
  } else if (!isValidPhone(phone)) {
    errors.push("Phone number format is invalid");
  }
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length === 0) {
    errors.push("Password cannot be empty");
  }
  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }
  next();
};

export const validateRefreshToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { refreshToken } = req.body;
  if (!refreshToken || typeof refreshToken !== "string") {
    errors.push("Refresh token is required");
  } else if (refreshToken.trim().length === 0) {
    errors.push("Refresh token cannot be empty");
  }
  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }
  next();
};
