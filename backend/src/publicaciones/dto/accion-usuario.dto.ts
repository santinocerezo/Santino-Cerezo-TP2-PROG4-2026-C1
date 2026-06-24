import { IsMongoId } from 'class-validator';

// Se usa para acciones que necesitan saber qué usuario las realiza
// (eliminar publicación, dar/quitar me gusta). Hasta el Sprint 3 (JWT)
// el id del usuario se envía desde el frontend.
export class AccionUsuarioDto {
  @IsMongoId({ message: 'El usuario no es válido' })
  usuarioId: string;
}
