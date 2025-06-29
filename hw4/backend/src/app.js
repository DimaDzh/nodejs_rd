import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import pino from "pino-http";
import { config } from "./config/index.js";
import { container } from "./container.js";
import { scopePerRequest } from "awilix-express";
import swaggerUi from "swagger-ui-express";
import { generateSpecs } from "./docs/index.js";
import { rateLimitMiddleware } from "./middlewares/rateLimitMiddleware.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { router as brewsRoute } from "./routes/brews.route.js";
import { attachStaticHandler } from "./static/attach-static-handler.js";
export function createApp() {
  const app = express();

  // Security and performance middlewares
  app.use(helmet());

  app.use(cors());

  app.use(compression());

  // Limits requests per IP (e.g., 100 requests per minute)
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Apply rate limiting only for POST requests
  app.use(rateLimitMiddleware);

  // Logging middlewares

  app.use(morgan("dev"));

  // logs for production
  app.use(pino());

  // Body parsers
  // Parses JSON and URL-encoded payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // (DI)

  app.use(scopePerRequest(container));

  // Routing

  app.use("/api", brewsRoute);

  // Static SPA
  attachStaticHandler(app);

  // Swagger docs
  if (config.env === "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(generateSpecs()));
    console.log(`Swagger docs → ${config.baseUrl}/docs`);
  }

  // Error handling middlewares

  app.use(notFound);

  // Global error handler

  app.use(errorHandler);

  return app;
}
