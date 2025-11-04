import { Router } from "express";
import * as authController from "./auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
} from "./auth.validators.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// Register a new user
router.post("/register", validateRegister, authController.register);

// Authenticate user and get tokens
router.post("/login", validateLogin, authController.login);

// Refresh access token
router.post("/refresh", validateRefreshToken, authController.refreshToken);

// Logout user
router.post("/logout", authenticate, authController.logout);

// Get current user profile
router.get("/me", authenticate, authController.getMe);

export default router;
