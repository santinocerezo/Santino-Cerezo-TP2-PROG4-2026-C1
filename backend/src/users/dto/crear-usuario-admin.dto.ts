import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto';
import type { Perfil } from '../schemas/user.schema';

/**
 * Alta de usuario hecha por un administrador (Sprint 4).
 * Reutiliza todas las validaciones del registro normal y agrega el campo
 * "perfil" para poder crear tanto usuarios comunes como administradores
 * (en el front se elige con dos radio buttons).
 */
export class CrearUsuarioAdminDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil debe ser "usuario" o "administrador"',
  })
  perfil: Perfil;
}
