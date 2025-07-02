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
  /* Swagger */
  const swaggerCfg = new DocumentBuilder()
    .setTitle("Nest Tea Lovers")
    .setDescription("Tea‑Tracker API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT || 3000;

  logger.log(`Swagger docs available at http://localhost:${port}/docs`);

  process.on("SIGINT", () => {
    logger.log("Bye tea‑lovers 👋");
    process.exit(0);
  });

  await app.listen(port);
}

bootstrap();
