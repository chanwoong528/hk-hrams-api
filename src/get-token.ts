import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const jwt = app.get(JwtService);
  
  // Create a token for moocw or junsik
  const payload = { userId: "e6f9fd1b-b72e-4b4f-8dd6-9eb1defdf79e", email: "junsik@hankookilbo.com" };
  const token = jwt.sign(payload);
  console.log('TOKEN=', token);
  
  await app.close();
}
bootstrap();
