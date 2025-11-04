import logger from "./shared/logger.js";
import { env } from "./shared/env.config.js";
import prisma from "./shared/prisma.js";
import app from "./app.js";

const PORT = env.PORT;

process.on("uncaughtException", (error: Error) => {
  logger.error({ error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error({ reason, promise }, "Unhandled rejection");
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Server closed");
    process.exit(0);
  });
});

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    logger.info("Database connection established");
    const baseUrl = `http://localhost:${PORT}`;
    logger.info(`App running at ${baseUrl}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
});

export default server;
