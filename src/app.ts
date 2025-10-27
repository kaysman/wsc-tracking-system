import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { env } from "./shared/env.config";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import {
  globalRateLimiter,
  authRateLimiter,
} from "./middlewares/rateLimit.middleware";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import rolesRoutes from "./modules/roles/roles.routes";
import officesRoutes from "./modules/offices/offices.routes";
import branchesRoutes from "./modules/branches/branches.routes";
import trucksRoutes from "./modules/trucks/trucks.routes";
import deliveryPlacesRoutes from "./modules/deliveryPlaces/deliveryPlaces.routes";
import deliveriesRoutes from "./modules/deliveries/deliveries.routes";

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
