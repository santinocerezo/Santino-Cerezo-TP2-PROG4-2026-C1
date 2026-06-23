import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    // Hace disponibles las variables del archivo .env en toda la aplicación.
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB Atlas. La cadena de conexión se lee del .env.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    // Módulos del dominio (requisito Sprint 1).
    AuthModule,
    UsersModule,
    PublicacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
