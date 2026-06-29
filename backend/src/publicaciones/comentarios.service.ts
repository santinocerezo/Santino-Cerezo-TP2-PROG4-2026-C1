import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import {
  Publicacion,
  PublicacionDocument,
} from './schemas/publicacion.schema';

@Injectable()
export class ComentariosService {
  // Campos del autor que devolvemos (nunca la contraseña).
  private readonly AUTOR = 'nombre apellido nombreUsuario fotoPerfil perfil';

  constructor(
    @InjectModel(Comentario.name)
    private readonly model: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicaciones: Model<PublicacionDocument>,
  ) {}

  // Verifica que la publicación exista y no esté dada de baja.
  private async verificarPublicacion(publicacionId: string) {
    const pub = await this.publicaciones.findById(publicacionId);
    if (!pub || pub.eliminado) {
      throw new NotFoundException('Publicación no encontrada');
    }
  }

  // Alta de comentario: queda asociado a la publicación y al usuario del token.
  async crear(publicacionId: string, autorId: string, mensaje: string) {
    await this.verificarPublicacion(publicacionId);
    const comentario = await this.model.create({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(autorId),
      mensaje,
    });
    return comentario.populate('autor', this.AUTOR);
  }

  // Listado paginado de una publicación, los más recientes primero.
  async listar(publicacionId: string, offset = 0, limit = 5) {
    await this.verificarPublicacion(publicacionId);
    const filtro = {
      publicacion: new Types.ObjectId(publicacionId),
      eliminado: false,
    };

    const [items, total] = await Promise.all([
      this.model
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .populate('autor', this.AUTOR)
        .exec(),
      this.model.countDocuments(filtro),
    ]);

    return { items, total, offset, limit };
  }

  // Edición: solo el autor puede editar. Marca el comentario como modificado.
  async editar(comentarioId: string, autorId: string, mensaje: string) {
    const comentario = await this.model.findById(comentarioId);
    if (!comentario || comentario.eliminado) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if (comentario.autor.toString() !== autorId) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();
    return comentario.populate('autor', this.AUTOR);
  }
}
