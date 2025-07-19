import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {AppModule} from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();
