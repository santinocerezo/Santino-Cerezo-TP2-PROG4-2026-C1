import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    UsersModule,
    CloudinaryModule,
    // Configuración del JWT: el secreto viene del .env y el token
    // vence a los 15 minutos (requisito del Sprint 3).
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'clave-secreta-dev',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  // Exportamos JwtModule y el guard para que el módulo de publicaciones
  // pueda proteger sus rutas con el mismo JWT.
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
