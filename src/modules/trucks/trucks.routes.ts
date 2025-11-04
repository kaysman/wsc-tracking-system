import { Router } from "express";
import * as trucksController from "./trucks.controller.js";
import {
  validateCreateTruck,
  validateUpdateTruck,
  validateUpdateMaintenance,
} from "./trucks.validators.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", validateCreateTruck, trucksController.createTruck);

router.get("/", trucksController.getAllTrucks);

router.get("/:id", trucksController.getTruckById);

router.put("/:id", validateUpdateTruck, trucksController.updateTruck);

router.post(
  "/:id/maintenance",
  validateUpdateMaintenance,
  trucksController.updateTruckMaintenance
);

router.delete("/:id", trucksController.deleteTruck);

router.get("/:id/deliveries", trucksController.getTruckDeliveries);

export default router;
