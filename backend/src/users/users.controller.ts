import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsuarioToken } from '../auth/usuario-token.decorator';

/**
 * Módulo usuarios - usuarios controller (Sprint 4).
 * Solo accesible para administradores: cada ruta pasa primero por el guard
 * de JWT (token válido) y luego por el guard de admin (rol correcto).
 */
@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /usuarios -> listado de todos los usuarios.
  @Get()
  listar() {
    return this.usersService.listarTodos();
  }

  // POST /usuarios -> alta de un usuario nuevo (se puede elegir el perfil).
  @Post()
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
    }),
  )
  crear(
    @Body() dto: CrearUsuarioAdminDto,
    @UploadedFile() fotoPerfil?: Express.Multer.File,
  ) {
    return this.usersService.crearComoAdmin(dto, fotoPerfil);
  }

  // DELETE /usuarios/:id -> baja lógica (deshabilita al usuario).
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deshabilitar(
    @Param('id') id: string,
    @UsuarioToken('sub') adminId: string,
  ) {
    // Un administrador no puede deshabilitarse a sí mismo (se bloquearía).
    if (id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    return this.usersService.deshabilitar(id);
  }

  // POST /usuarios/:id/habilitar -> alta lógica (rehabilita al usuario).
  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id') id: string) {
    return this.usersService.rehabilitar(id);
  }
}
