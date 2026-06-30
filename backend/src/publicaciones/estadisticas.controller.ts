import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { RangoFechasDto } from './dto/rango-fechas.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

/**
 * Módulo publicaciones - estadísticas controller (Sprint 4).
 * Todas las rutas son GET y devuelven los datos para los gráficos del
 * dashboard. Solo accesibles para administradores (JWT + rol admin).
 */
@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly service: EstadisticasService) {}

  // GET /estadisticas/publicaciones-por-usuario?desde=&hasta=  (barras)
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.service.publicacionesPorUsuario(rango);
  }

  // GET /estadisticas/comentarios-por-dia?desde=&hasta=  (líneas)
  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.service.comentariosPorDia(rango);
  }

  // GET /estadisticas/comentarios-por-publicacion?desde=&hasta=  (torta)
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.service.comentariosPorPublicacion(rango);
  }
}
