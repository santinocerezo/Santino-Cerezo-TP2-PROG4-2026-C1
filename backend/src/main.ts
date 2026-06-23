import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: permitimos que el frontend Angular consuma esta API.
  // En producción se restringe con la variable FRONTEND_URL (separar por comas).
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? true,
    credentials: true,
  });

  // Validación global de los DTOs usando class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta propiedades que no estén en el DTO
      transform: true, // convierte tipos (string -> Date/number, etc.)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend NestJS escuchando en el puerto ${port}`);
}
bootstrap();
