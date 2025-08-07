import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  /* === Swagger config === */
  const sw_config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription('Demo service for lecture 10')
    .setVersion('1.0')
    // .addBearerAuth() // якщо знадобиться в майбутньому
    .build();

  const document = SwaggerModule.createDocument(app, sw_config);
  SwaggerModule.setup('api', app, document); // UI → /api
  /* ====================== */

  const port = config.get('PORT') ?? 3000;
  await app.listen(port, () => {
    console.log(`API ready on :${port}`);
  });
}
bootstrap();
