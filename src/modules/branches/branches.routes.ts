import { Router } from "express";
import * as branchesController from "./branches.controller";
import {
  validateCreateBranch,
  validateUpdateBranch,
} from "./branches.validators";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Create branch
router.post("/", validateCreateBranch, branchesController.createBranch);

// Get all branches
router.get("/", branchesController.getAllBranches);

// Get branch by ID
router.get("/:id", branchesController.getBranchById);

// Update branch
router.put("/:id", validateUpdateBranch, branchesController.updateBranch);

// Delete branch
router.delete("/:id", branchesController.deleteBranch);

// Get branch trucks
router.get("/:id/trucks", branchesController.getBranchTrucks);

// Get branch deliveries
router.get("/:id/deliveries", branchesController.getBranchDeliveries);

export default router;
