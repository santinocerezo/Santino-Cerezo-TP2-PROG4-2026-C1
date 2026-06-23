import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  Publicacion,
  PublicacionDocument,
} from './schemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';

@Injectable()
export class PublicacionesService {
  // Campos del autor que devolvemos (nunca la contraseña).
  private readonly AUTOR = 'nombre apellido nombreUsuario fotoPerfil perfil';

  constructor(
    @InjectModel(Publicacion.name)
    private readonly model: Model<PublicacionDocument>,
    private readonly usersService: UsersService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Alta de publicación. Si trae imagen, la sube a Cloudinary.
  async crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File) {
    let url = '';
    if (imagen) {
      if (!imagen.mimetype?.startsWith('image/')) {
        throw new BadRequestException('El archivo debe ser una imagen');
      }
      url = await this.cloudinary.subirImagen(imagen, 'red-social/publicaciones');
    }
    const pub = await this.model.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagen: url,
      autor: new Types.ObjectId(dto.autor),
      meGusta: [],
      cantidadMeGusta: 0,
    });
    return pub.populate('autor', this.AUTOR);
  }

  // Listado: solo no eliminadas, con orden, filtro por autor y paginación.
  async listar(q: ListarPublicacionesDto) {
    const offset = q.offset ?? 0;
    const limit = q.limit ?? 10;

    const filtro: Record<string, unknown> = { eliminado: false };
    if (q.usuario) filtro.autor = new Types.ObjectId(q.usuario);

    const orden: Record<string, 1 | -1> =
      q.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.model
        .find(filtro)
        .sort(orden)
        .skip(offset)
        .limit(limit)
        .populate('autor', this.AUTOR)
        .exec(),
      this.model.countDocuments(filtro),
    ]);

    return { items, total, offset, limit };
  }

  // Baja lógica: solo la puede hacer el autor o un administrador.
  async eliminar(id: string, usuarioId: string) {
    const pub = await this.model.findById(id);
    if (!pub || pub.eliminado) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const usuario = await this.usersService.buscarPorId(usuarioId);
    if (!usuario) throw new UnauthorizedException('Usuario inválido');

    const esAutor = pub.autor.toString() === usuarioId;
    const esAdmin = usuario.perfil === 'administrador';
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación');
    }

    pub.eliminado = true;
    await pub.save();
    return { mensaje: 'Publicación eliminada correctamente' };
  }

  // Me gusta: un solo me gusta por usuario y publicación.
  async darMeGusta(id: string, usuarioId: string) {
    const pub = await this.model.findById(id);
    if (!pub || pub.eliminado) {
      throw new NotFoundException('Publicación no encontrada');
    }
    if (pub.meGusta.some((u) => u.toString() === usuarioId)) {
      throw new ConflictException('Ya diste me gusta a esta publicación');
    }
    pub.meGusta.push(new Types.ObjectId(usuarioId));
    pub.cantidadMeGusta = pub.meGusta.length;
    await pub.save();
    return pub.populate('autor', this.AUTOR);
  }

  // Quitar me gusta: solo si el usuario lo había dado.
  async quitarMeGusta(id: string, usuarioId: string) {
    const pub = await this.model.findById(id);
    if (!pub || pub.eliminado) {
      throw new NotFoundException('Publicación no encontrada');
    }
    if (!pub.meGusta.some((u) => u.toString() === usuarioId)) {
      throw new BadRequestException('No habías dado me gusta a esta publicación');
    }
    pub.meGusta = pub.meGusta.filter(
      (u) => u.toString() !== usuarioId,
    ) as Types.ObjectId[];
    pub.cantidadMeGusta = pub.meGusta.length;
    await pub.save();
    return pub.populate('autor', this.AUTOR);
  }
}
