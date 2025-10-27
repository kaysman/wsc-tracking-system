import { Router } from "express";
import * as deliveriesController from "./deliveries.controller";
import {
  validateCreateDelivery,
  validateUpdateDelivery,
} from "./deliveries.validators";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Create delivery
router.post("/", validateCreateDelivery, deliveriesController.createDelivery);

// Get all deliveries
router.get("/", deliveriesController.getAllDeliveries);

// Get delivery by ID
router.get("/:id", deliveriesController.getDeliveryById);

// Update delivery
router.put("/:id", validateUpdateDelivery, deliveriesController.updateDelivery);

// Delete delivery
router.delete("/:id", deliveriesController.deleteDelivery);

export default router;
