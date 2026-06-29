import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

// Request con el usuario ya verificado (lo agrega este guard).
export interface RequestConUsuario extends Request {
  user: JwtPayload;
}

/**
 * Guard de JWT. Lee el token del header "Authorization: Bearer <token>",
 * lo valida y, si es correcto, deja el payload en req.user.
 * Si falta el token o está vencido/inválido, responde 401.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se envió el token de autenticación');
    }

    const token = header.slice(7);
    try {
      req.user = this.jwt.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException('El token es inválido o ya venció');
    }
  }
}
