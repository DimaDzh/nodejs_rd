import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 1. Kafka microservice config
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-demo',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'nestjs-consumer-group',
      },
    },
  });

  //#region Swagger
  // 👇 2. Swagger
  const config = new DocumentBuilder()
    .setTitle('Kafka Demo')
    .setDescription('Producer & Consumer')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
//#endregion

  // 👇 3. Start HTTP app + Kafka microservice
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('✅ HTTP: http://localhost:3000');
  console.log('✅ Swagger: http://localhost:3000/docs');
}
bootstrap();