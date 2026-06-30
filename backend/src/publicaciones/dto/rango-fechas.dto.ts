import { IsDateString, IsOptional } from 'class-validator';

/**
 * Rango de fechas para las estadísticas (Sprint 4). Ambos extremos son
 * opcionales: si no se mandan, se calcula sobre todo el historial. Llegan
 * como query string 'AAAA-MM-DD'.
 */
export class RangoFechasDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha "desde" no es válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "hasta" no es válida' })
  hasta?: string;
}
