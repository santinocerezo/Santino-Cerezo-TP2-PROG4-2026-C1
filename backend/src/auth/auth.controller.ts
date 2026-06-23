import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro  ->  201 Created
  // Recibe los datos del formulario (multipart/form-data) + la imagen de perfil.
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

  // POST /auth/login  ->  200 OK (no es una creación, por eso forzamos el 200)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
