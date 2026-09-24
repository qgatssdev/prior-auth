import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Config } from './config';

async function bootstrap() {
  // rawBody: the webhook verifies its HMAC signature against the exact bytes received.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('/api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors({ origin: Config.FRONTEND_URL });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PA Desk API')
    .setDescription('Prior-authorization work queue. All data is fake.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app
    .listen(Config.PORT)
    .then(() => console.log('Listening on', Config.PORT));
}
void bootstrap();
