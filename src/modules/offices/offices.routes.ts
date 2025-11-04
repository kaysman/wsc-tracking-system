import { Router } from "express";
import * as officesController from "./offices.controller.js";
import {
  validateCreateOffice,
  validateUpdateOffice,
} from "./offices.validators.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Create office
router.post("/", validateCreateOffice, officesController.createOffice);

// Get all offices
router.get("/", officesController.getAllOffices);

// Get office by ID
router.get("/:id", officesController.getOfficeById);

// Update office
router.put("/:id", validateUpdateOffice, officesController.updateOffice);

// Delete office
router.delete("/:id", officesController.deleteOffice);

// Get office trucks
router.get("/:id/trucks", officesController.getOfficeTrucks);

// Get office branches
router.get("/:id/branches", officesController.getOfficeBranches);

// Get office deliveries
router.get("/:id/deliveries", officesController.getOfficeDeliveries);

export default router;
