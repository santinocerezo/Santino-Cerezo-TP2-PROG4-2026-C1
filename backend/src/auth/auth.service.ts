import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinary: CloudinaryService,
    private readonly jwt: JwtService,
  ) {}

  async registro(dto: RegistroDto, foto?: Express.Multer.File) {
    // 1) Las contraseñas deben coincidir.
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2) El correo y el nombre de usuario deben ser únicos.
    if (await this.usersService.buscarPorCorreo(dto.correo)) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }
    if (await this.usersService.buscarPorNombreUsuario(dto.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya está en uso');
    }

    // 3) Si se envió una imagen, validamos y la subimos a Cloudinary.
    let fotoPerfil = '';
    if (foto) {
      if (!foto.mimetype?.startsWith('image/')) {
        throw new BadRequestException('El archivo de perfil debe ser una imagen');
      }
      fotoPerfil = await this.cloudinary.subirImagen(foto, 'red-social/perfiles');
    }

    // 4) Encriptamos la contraseña (NUNCA se guarda en texto plano).
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 5) Guardamos el usuario. El perfil por defecto es "usuario".
    const usuario = await this.usersService.crear({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      password: passwordHash,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      descripcion: dto.descripcion ?? '',
      fotoPerfil,
      perfil: 'usuario',
    });

    // El toJSON del schema quita la contraseña automáticamente.
    // Devolvemos también el token JWT (Sprint 3).
    return {
      mensaje: 'Usuario registrado correctamente',
      usuario,
      token: this.firmarToken(usuario),
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usersService.buscarPorCorreoONombre(
      dto.identificador,
    );

    // Mensaje genérico para no revelar si el usuario existe o no.
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (usuario.eliminado) {
      throw new UnauthorizedException('El usuario se encuentra deshabilitado');
    }

    // Comparamos la contraseña recibida con el hash guardado.
    const passwordOk = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      mensaje: 'Login correcto',
      usuario,
      token: this.firmarToken(usuario),
    };
  }

  // POST /auth/autorizar: el guard ya validó el token. Devolvemos los
  // datos actualizados del usuario (o 401 si dejó de existir / fue deshabilitado).
  async autorizar(usuarioId: string) {
    const usuario = await this.usersService.buscarPorId(usuarioId);
    if (!usuario || usuario.eliminado) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    return { usuario };
  }

  // POST /auth/refrescar: el guard ya validó el token. Emitimos uno nuevo
  // con la misma información y otros 15 minutos de vigencia.
  refrescar(payload: JwtPayload) {
    const nuevo = this.jwt.sign({
      sub: payload.sub,
      correo: payload.correo,
      nombreUsuario: payload.nombreUsuario,
      perfil: payload.perfil,
    } satisfies JwtPayload);
    return { token: nuevo };
  }

  // Firma un token con la identidad y el rol del usuario.
  private firmarToken(usuario: UserDocument): string {
    const payload: JwtPayload = {
      sub: usuario.id as string,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };
    return this.jwt.sign(payload);
  }
}
