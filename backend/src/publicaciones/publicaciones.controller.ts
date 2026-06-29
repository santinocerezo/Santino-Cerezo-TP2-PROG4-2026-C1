import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioToken } from '../auth/usuario-token.decorator';

// Todas las rutas requieren un token JWT válido (Sprint 3).
@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  // POST /publicaciones -> 201 (el autor se toma del token)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  crear(
    @Body() dto: CrearPublicacionDto,
    @UsuarioToken('sub') usuarioId: string,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.service.crear(dto, usuarioId, imagen);
  }

  // GET /publicaciones?orden=fecha|meGusta&usuario=<id>&offset=0&limit=10
  @Get()
  listar(@Query() query: ListarPublicacionesDto) {
    return this.service.listar(query);
  }

  // GET /publicaciones/:id -> detalle de una publicación
  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.service.obtener(id);
  }

  // DELETE /publicaciones/:id -> baja lógica (autor o admin, según el token)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(@Param('id') id: string, @UsuarioToken('sub') usuarioId: string) {
    return this.service.eliminar(id, usuarioId);
  }

  // POST /publicaciones/:id/me-gusta -> dar me gusta (usuario del token)
  @Post(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  darMeGusta(@Param('id') id: string, @UsuarioToken('sub') usuarioId: string) {
    return this.service.darMeGusta(id, usuarioId);
  }

  // DELETE /publicaciones/:id/me-gusta -> quitar me gusta (usuario del token)
  @Delete(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  quitarMeGusta(
    @Param('id') id: string,
    @UsuarioToken('sub') usuarioId: string,
  ) {
    return this.service.quitarMeGusta(id, usuarioId);
  }
}
