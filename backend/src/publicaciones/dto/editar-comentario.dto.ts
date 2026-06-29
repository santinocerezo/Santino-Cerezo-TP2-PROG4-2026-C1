import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EditarComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(1000, { message: 'El comentario es demasiado largo' })
  mensaje: string;
}
