import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { RangoFechasDto } from './dto/rango-fechas.dto';

// Cada fila de un gráfico: una etiqueta y su valor.
export interface FilaEstadistica {
  etiqueta: string;
  cantidad: number;
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicaciones: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarios: Model<ComentarioDocument>,
  ) {}

  /**
   * Arma el filtro de fecha para el rango pedido. "hasta" se interpreta como
   * fin del día (inclusive). Si un extremo no viene, queda abierto.
   */
  private filtroRango(rango: RangoFechasDto): Record<string, unknown> {
    const filtro: { eliminado: boolean; createdAt?: Record<string, Date> } = {
      eliminado: false,
    };
    const createdAt: Record<string, Date> = {};
    if (rango.desde) {
      createdAt.$gte = new Date(`${rango.desde}T00:00:00.000`);
    }
    if (rango.hasta) {
      createdAt.$lte = new Date(`${rango.hasta}T23:59:59.999`);
    }
    if (Object.keys(createdAt).length > 0) {
      filtro.createdAt = createdAt;
    }
    return filtro;
  }

  /**
   * Gráfico 1 (barras): cantidad de publicaciones realizadas por cada usuario
   * en el rango elegido.
   */
  async publicacionesPorUsuario(
    rango: RangoFechasDto,
  ): Promise<FilaEstadistica[]> {
    const pipeline: PipelineStage[] = [
      { $match: this.filtroRango(rango) },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      {
        $project: {
          _id: 0,
          etiqueta: '$autor.nombreUsuario',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, etiqueta: 1 } },
    ];
    return this.publicaciones.aggregate<FilaEstadistica>(pipeline);
  }

  /**
   * Gráfico 2 (líneas): cantidad de comentarios realizados por día en el rango
   * elegido (serie temporal).
   */
  async comentariosPorDia(rango: RangoFechasDto): Promise<FilaEstadistica[]> {
    const pipeline: PipelineStage[] = [
      { $match: this.filtroRango(rango) },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, etiqueta: '$_id', cantidad: 1 } },
      { $sort: { etiqueta: 1 } },
    ];
    return this.comentarios.aggregate<FilaEstadistica>(pipeline);
  }

  /**
   * Gráfico 3 (torta): cantidad de comentarios en cada publicación en el rango
   * elegido. Se limita a las 10 publicaciones más comentadas para que la torta
   * sea legible.
   */
  async comentariosPorPublicacion(
    rango: RangoFechasDto,
  ): Promise<FilaEstadistica[]> {
    const pipeline: PipelineStage[] = [
      { $match: this.filtroRango(rango) },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $sort: { cantidad: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          // Nombre real de la colección (evita adivinar la pluralización).
          from: this.publicaciones.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'publicacion',
        },
      },
      { $unwind: '$publicacion' },
      {
        $project: {
          _id: 0,
          etiqueta: '$publicacion.titulo',
          cantidad: 1,
        },
      },
    ];
    return this.comentarios.aggregate<FilaEstadistica>(pipeline);
  }
}
