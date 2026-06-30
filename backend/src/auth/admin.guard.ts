import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestConUsuario } from './jwt-auth.guard';

/**
 * Guard de rol (Sprint 4). Se usa SIEMPRE después de JwtAuthGuard, que es
 * quien deja el payload del token en req.user. Acá solo verificamos que ese
 * usuario tenga perfil de administrador; si no, responde 403 Forbidden.
 *
 * Uso: @UseGuards(JwtAuthGuard, AdminGuard)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestConUsuario>();
    if (req.user?.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Esta acción es solo para administradores',
      );
    }
    return true;
  }
}
