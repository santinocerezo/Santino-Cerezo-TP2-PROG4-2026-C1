import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';

export class CrearComentarioDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MaxLength(1000, { message: 'El comentario es demasiado largo' })
  mensaje: string;
}
