import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { BaseAPIDocument } from './swagger.document';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const document = SwaggerModule.createDocument(
    app,
    new BaseAPIDocument().initializeOptions(),
  );
  // Swagger UI에 대한 path를 연결함
  // .setup('swagger ui endpoint', app, swagger_document)
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  app.enableCors({
    origin: 'http://localhost:5173', // Allow requests only from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow sending of cookies and authorization headers
  });

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
