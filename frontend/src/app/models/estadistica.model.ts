// Una fila de cualquier gráfico: una etiqueta y su valor (Sprint 4).
export interface FilaEstadistica {
  etiqueta: string;
  cantidad: number;
}

// Rango de fechas elegido para filtrar las estadísticas.
export interface RangoFechas {
  desde?: string; // 'AAAA-MM-DD'
  hasta?: string; // 'AAAA-MM-DD'
}
