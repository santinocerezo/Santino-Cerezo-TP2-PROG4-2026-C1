import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class ListarPublicacionesDto {
  // Orden del listado: por fecha (defecto) o por cantidad de me gusta.
  @IsOptional()
  @IsIn(['fecha', 'meGusta'])
  orden?: 'fecha' | 'meGusta';

  // Filtrar por autor (id de usuario).
  @IsOptional()
  @IsMongoId()
  usuario?: string;

  // Paginación.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
