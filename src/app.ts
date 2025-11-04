import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { env } from "./shared/env.config.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import {
  globalRateLimiter,
  authRateLimiter,
} from "./middlewares/rateLimit.middleware.js";

// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import rolesRoutes from "./modules/roles/roles.routes.js";
import officesRoutes from "./modules/offices/offices.routes.js";
import branchesRoutes from "./modules/branches/branches.routes.js";
import trucksRoutes from "./modules/trucks/trucks.routes.js";
import deliveryPlacesRoutes from "./modules/deliveryPlaces/deliveryPlaces.routes.js";
import deliveriesRoutes from "./modules/deliveries/deliveries.routes.js";

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(globalRateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

// v1 Routes
app.use("/api/v1/auth", authRateLimiter, authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/offices", officesRoutes);
app.use("/api/v1/branches", branchesRoutes);
app.use("/api/v1/trucks", trucksRoutes);
app.use("/api/v1/delivery-places", deliveryPlacesRoutes);
app.use("/api/v1/deliveries", deliveriesRoutes);

// 404 + errors
app.use(notFound);
app.use(errorHandler);

export default app;
