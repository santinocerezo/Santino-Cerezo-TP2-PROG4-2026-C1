import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuarioToken } from './usuario-token.decorator';
import type { JwtPayload } from './jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro  ->  201 Created (devuelve el usuario y el token JWT)
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
    }),
  )
  registro(
    @Body() dto: RegistroDto,
    @UploadedFile() fotoPerfil?: Express.Multer.File,
  ) {
    return this.authService.registro(dto, fotoPerfil);
  }

  // POST /auth/login  ->  200 OK (devuelve el usuario y el token JWT)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/autorizar -> 200 si el token es válido (401 si no, lo lanza el guard).
  // Devuelve los datos del usuario dueño del token.
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  autorizar(@UsuarioToken('sub') usuarioId: string) {
    return this.authService.autorizar(usuarioId);
  }

  // POST /auth/refrescar -> 200 con un token nuevo (misma payload, +15 min).
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refrescar(@UsuarioToken() payload: JwtPayload) {
    return this.authService.refrescar(payload);
  }
}
