import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // Crea y guarda un usuario nuevo.
  crear(datos: Partial<User>): Promise<UserDocument> {
    const nuevo = new this.userModel(datos);
    return nuevo.save();
  }

  buscarPorCorreo(correo: string) {
    return this.userModel.findOne({ correo: correo.toLowerCase() }).exec();
  }

  buscarPorNombreUsuario(nombreUsuario: string) {
    return this.userModel.findOne({ nombreUsuario }).exec();
  }

  // Permite encontrar al usuario tanto por correo como por nombre de usuario
  // (se usa en el login).
  buscarPorCorreoONombre(identificador: string) {
    return this.userModel
      .findOne({
        $or: [
          { correo: identificador.toLowerCase() },
          { nombreUsuario: identificador },
        ],
      })
      .exec();
  }

  buscarPorId(id: string) {
    return this.userModel.findById(id).exec();
  }

  // ----------------------------------------------------------------------
  // Sprint 4: acciones de administrador (listar / crear / habilitar / bajar)
  // ----------------------------------------------------------------------

  /** Listado completo de usuarios, los más nuevos primero. */
  listarTodos(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Alta de un usuario hecha por un administrador. A diferencia del registro
   * normal, permite elegir el perfil ("usuario" o "administrador") y no
   * devuelve token (el admin sigue con su propia sesión).
   */
  async crearComoAdmin(dto: CrearUsuarioAdminDto, foto?: Express.Multer.File) {
    // 1) Las contraseñas deben coincidir.
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2) Correo y nombre de usuario únicos.
    if (await this.buscarPorCorreo(dto.correo)) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }
    if (await this.buscarPorNombreUsuario(dto.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    // 3) Foto opcional a Cloudinary.
    let fotoPerfil = '';
    if (foto) {
      if (!foto.mimetype?.startsWith('image/')) {
        throw new BadRequestException('El archivo de perfil debe ser una imagen');
      }
      fotoPerfil = await this.cloudinary.subirImagen(foto, 'red-social/perfiles');
    }

    // 4) Contraseña encriptada (nunca en texto plano).
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 5) Guardamos con el perfil elegido por el administrador.
    const usuario = await this.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordHash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion ?? '',
      fotoPerfil,
      perfil: dto.perfil,
      sid: randomUUID(),
    });

    return { mensaje: 'Usuario creado correctamente', usuario };
  }

  /**
   * Baja lógica: deshabilita un usuario. Cuando intente loguearse será
   * notificado de que no está autorizado (lo controla el login).
   */
  async deshabilitar(id: string) {
    const usuario = await this.userModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (usuario.eliminado) {
      throw new BadRequestException('El usuario ya estaba deshabilitado');
    }
    usuario.eliminado = true;
    // Invalidamos su sesión actual: el sid deja de coincidir y el guard lo corta.
    usuario.sid = '';
    await usuario.save();
    return { mensaje: 'Usuario deshabilitado correctamente', usuario };
  }

  /** Alta lógica: rehabilita un usuario previamente deshabilitado. */
  async rehabilitar(id: string) {
    const usuario = await this.userModel.findById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!usuario.eliminado) {
      throw new BadRequestException('El usuario ya estaba habilitado');
    }
    usuario.eliminado = false;
    await usuario.save();
    return { mensaje: 'Usuario habilitado correctamente', usuario };
  }
}
