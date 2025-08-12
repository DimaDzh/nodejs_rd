import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";

import { AppModule } from "./app.module";
import { ApiKeyGuard } from "./shared/guards/api-key.guard";
import { Reflector } from "@nestjs/core";
import { ResponseTimeInterceptor } from "./shared/interceptors/responseTime.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const logger = app.get(Logger);
  /* global middlewares / pipes / interceptors */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ResponseTimeInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  app.useGlobalGuards(new ApiKeyGuard(reflector));

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  /* Swagger */
  const swaggerCfg = new DocumentBuilder()
    .setTitle("Nest Tea Lovers")
    .setDescription(`Tea‑Tracker API with Rate Limiting`)
    .setVersion("1.1")
    .addApiKey(
      {
        type: "apiKey",
        name: "x-api-key",
        in: "header",
        description: "API Key for authentication",
      },
      "x-api-key"
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT || 3000;

  logger.log(`Swagger docs available at http://localhost:${port}/docs`);

  // Graceful shutdown handling
  process.on("SIGINT", async () => {
    logger.log("Bye tea‑lovers 👋");
    await app.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    logger.log("Received SIGTERM, shutting down gracefully...");
    await app.close();
    process.exit(0);
  });

  await app.listen(port);
}

bootstrap();
