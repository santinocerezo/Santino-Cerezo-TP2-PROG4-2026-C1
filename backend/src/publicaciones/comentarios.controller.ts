import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { EditarComentarioDto } from './dto/editar-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuarioToken } from '../auth/usuario-token.decorator';

// Comentarios de una publicación. Todas las rutas requieren token (JWT).
@Controller()
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private readonly service: ComentariosService) {}

  // GET /publicaciones/:publicacionId/comentarios?offset=0&limit=5
  @Get('publicaciones/:publicacionId/comentarios')
  listar(
    @Param('publicacionId') publicacionId: string,
    @Query() query: ListarComentariosDto,
  ) {
    return this.service.listar(publicacionId, query.offset, query.limit);
  }

  // POST /publicaciones/:publicacionId/comentarios -> 201 (agrega un comentario)
  @Post('publicaciones/:publicacionId/comentarios')
  crear(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioToken('sub') usuarioId: string,
  ) {
    return this.service.crear(publicacionId, usuarioId, dto.mensaje);
  }

  // PUT /comentarios/:id -> edita el mensaje (solo el autor)
  @Put('comentarios/:id')
  editar(
    @Param('id') id: string,
    @Body() dto: EditarComentarioDto,
    @UsuarioToken('sub') usuarioId: string,
  ) {
    return this.service.editar(id, usuarioId, dto.mensaje);
  }
}
