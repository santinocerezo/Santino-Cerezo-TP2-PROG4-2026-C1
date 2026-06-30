import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';
import { UsersService } from '../users/users.service';

// Request con el usuario ya verificado (lo agrega este guard).
export interface RequestConUsuario extends Request {
  user: JwtPayload;
}

/**
 * Guard de JWT. Lee el token del header "Authorization: Bearer <token>",
 * lo valida y, si es correcto, deja el payload en req.user.
 *
 * Además exige que el "sid" (id de sesión) del token coincida con el de la
 * cuenta en la base: así una cuenta solo puede estar activa en un dispositivo
 * a la vez. Si falta el token, está vencido/inválido, o la sesión fue
 * reemplazada por otra, responde 401.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se envió el token de autenticación');
    }

    const token = header.slice(7);
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('El token es inválido o ya venció');
    }

    // La cuenta debe existir y no estar dada de baja.
    const usuario = await this.usersService.buscarPorId(payload.sub);
    if (!usuario || usuario.eliminado) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }

    // Sesión única: si el sid no coincide, esta sesión fue reemplazada por
    // un login en otro dispositivo.
    if (!payload.sid || usuario.sid !== payload.sid) {
      throw new UnauthorizedException(
        'Tu sesión se cerró porque se inició sesión en otro dispositivo',
      );
    }

    req.user = payload;
    return true;
  }
}
