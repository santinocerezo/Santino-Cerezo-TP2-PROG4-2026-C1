import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { RequestConUsuario } from './jwt-auth.guard';

/**
 * Decorador para leer el usuario del token dentro de un controlador.
 * - @UsuarioToken() devuelve todo el payload.
 * - @UsuarioToken('sub') devuelve solo ese campo (ej. el id del usuario).
 * Se usa siempre junto con JwtAuthGuard.
 */
export const UsuarioToken = createParamDecorator(
  (campo: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestConUsuario>();
    return campo ? req.user?.[campo] : req.user;
  },
);
