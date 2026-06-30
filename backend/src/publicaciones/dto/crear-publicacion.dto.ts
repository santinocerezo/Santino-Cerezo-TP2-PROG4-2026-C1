import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';

export class CrearPublicacionDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  titulo: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, { message: 'La descripción es demasiado larga' })
  descripcion: string;

  // El autor ya NO se envía desde el frontend: se toma del token JWT (Sprint 3).
}
