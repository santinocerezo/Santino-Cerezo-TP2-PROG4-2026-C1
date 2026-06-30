import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * Edición del perfil. Todos los campos son opcionales: se actualiza solo lo
 * que venga. La foto NO va acá (llega como archivo multipart aparte).
 */
export class EditarPerfilDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede quedar vacío' })
  @MaxLength(60, { message: 'El nombre es demasiado largo' })
  nombre?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El apellido no puede quedar vacío' })
  @MaxLength(60, { message: 'El apellido es demasiado largo' })
  apellido?: string;

  @IsOptional()
  @Trim()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre de usuario es demasiado largo' })
  nombreUsuario?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede superar los 300 caracteres' })
  descripcion?: string;
}
