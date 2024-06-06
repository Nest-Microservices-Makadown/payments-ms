import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-ms');

  /* Create the NestJS application in REST mode */
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  /* Enabling NATS mode for the NestJS application */
  app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS
      }
    }, 
    { inheritAppConfig: true } // this inherits structure validations in controllers (i.e. sent in @Body())
  );

  await app.startAllMicroservices();
  await app.listen(envs.PORT);


  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Hybrid mode for NATS server(s) available: [${envs.NATS_SERVERS}]`);
}
bootstrap();
