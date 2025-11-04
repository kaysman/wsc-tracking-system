import express from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { PERMISSIONS } from "../../shared/permissions.js";
import * as usersController from "./users.controller.js";

const router = express.Router();

// Get all users
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.USERS_LIST),
  usersController.getAll
);

// Get user by ID
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USERS_READ),
  usersController.getById
);

// Update user
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USERS_UPDATE),
  usersController.update
);

// Soft delete user
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USERS_DELETE),
  usersController.softDelete
);

// Deactivate user
router.post(
  "/:id/deactivate",
  authenticate,
  authorize(PERMISSIONS.USERS_UPDATE),
  usersController.deactivate
);

// Reactivate user
router.post(
  "/:id/reactivate",
  authenticate,
  authorize(PERMISSIONS.USERS_UPDATE),
  usersController.reactivate
);

// Assign role to user
router.post(
  "/:id/assign-role",
  authenticate,
  authorize(PERMISSIONS.USERS_UPDATE),
  usersController.assignRole
);

export default router;
