import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    // forwardRef: UsersModule también importa AuthModule (para los guards),
    // así que la dependencia es mutua.
    forwardRef(() => UsersModule),
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
  providers: [AuthService, JwtAuthGuard, AdminGuard],
  // Exportamos JwtModule y los guards para que otros módulos (publicaciones,
  // usuarios) puedan proteger sus rutas con el mismo JWT y el rol admin.
  exports: [JwtModule, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
