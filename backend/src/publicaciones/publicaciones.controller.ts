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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { AccionUsuarioDto } from './dto/accion-usuario.dto';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  // POST /publicaciones -> 201 (alta de publicación, con imagen opcional)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  crear(
    @Body() dto: CrearPublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.service.crear(dto, imagen);
  }

  // GET /publicaciones?orden=fecha|meGusta&usuario=<id>&offset=0&limit=10
  @Get()
  listar(@Query() query: ListarPublicacionesDto) {
    return this.service.listar(query);
  }

  // DELETE /publicaciones/:id -> baja lógica (autor o admin)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  eliminar(@Param('id') id: string, @Body() dto: AccionUsuarioDto) {
    return this.service.eliminar(id, dto.usuarioId);
  }

  // POST /publicaciones/:id/me-gusta -> dar me gusta
  @Post(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  darMeGusta(@Param('id') id: string, @Body() dto: AccionUsuarioDto) {
    return this.service.darMeGusta(id, dto.usuarioId);
  }

  // DELETE /publicaciones/:id/me-gusta -> quitar me gusta
  @Delete(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  quitarMeGusta(@Param('id') id: string, @Body() dto: AccionUsuarioDto) {
    return this.service.quitarMeGusta(id, dto.usuarioId);
  }
}
