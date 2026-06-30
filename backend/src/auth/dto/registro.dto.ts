import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';
import { EsEdadValida } from '../../common/validators/edad.validator';

export class RegistroDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @Trim()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  nombreUsuario: string;

  // Mínimo 8 caracteres, al menos una mayúscula y un número.
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe incluir al menos una mayúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Debe repetir la contraseña' })
  repetirPassword: string;

  // Llega como string 'AAAA-MM-DD' desde el formulario.
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  @EsEdadValida({ message: 'Tenés que tener entre 13 y 120 años' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede superar los 300 caracteres' })
  descripcion?: string;
}
