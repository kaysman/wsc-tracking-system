import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorization.middleware";
import { PERMISSIONS } from "../../shared/permissions";
import * as rolesController from "./roles.controller";

const router = express.Router();

// Get all available permissions
router.get(
  "/permissions",
  authenticate,
  authorize(PERMISSIONS.ROLES_READ),
  rolesController.getAvailablePermissions
);

// Create new role
router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.ROLES_CREATE),
  rolesController.create
);

// Get all roles
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ROLES_LIST),
  rolesController.getAll
);

// Get role by ID
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ROLES_READ),
  rolesController.getById
);

// Update role
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ROLES_UPDATE),
  rolesController.update
);

// Soft delete role
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.ROLES_DELETE),
  rolesController.softDelete
);

// Assign permissions to role
router.post(
  "/:id/assign-permissions",
  authenticate,
  authorize(PERMISSIONS.PERMISSIONS_MANAGE),
  rolesController.assignPermissions
);

export default router;
