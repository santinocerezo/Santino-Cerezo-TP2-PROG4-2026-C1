import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, { message: 'La descripción es demasiado larga' })
  descripcion: string;

  // Id del usuario autor. Hasta el Sprint 3 (JWT) se envía desde el frontend.
  @IsMongoId({ message: 'El autor no es válido' })
  autor: string;
}
