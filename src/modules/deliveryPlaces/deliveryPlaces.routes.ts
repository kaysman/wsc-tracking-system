import { Router } from "express";
import * as deliveryPlacesController from "./deliveryPlaces.controller";
import {
  validateCreateDeliveryPlace,
  validateUpdateDeliveryPlace,
} from "./deliveryPlaces.validators";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Create delivery place
router.post(
  "/",
  validateCreateDeliveryPlace,
  deliveryPlacesController.createDeliveryPlace
);

// Get all delivery places
router.get("/", deliveryPlacesController.getAllDeliveryPlaces);

// Get delivery place by ID
router.get("/:id", deliveryPlacesController.getDeliveryPlaceById);

// Update delivery place
router.put(
  "/:id",
  validateUpdateDeliveryPlace,
  deliveryPlacesController.updateDeliveryPlace
);

// Delete delivery place
router.delete("/:id", deliveryPlacesController.deleteDeliveryPlace);

export default router;
