import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilaEstadistica, RangoFechas } from '../models/estadistica.model';

/**
 * Servicio de estadísticas (Sprint 4). Trae los datos para los gráficos del
 * dashboard. Solo para administradores (el backend valida el rol con el token).
 */
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  private params(rango: RangoFechas): HttpParams {
    let params = new HttpParams();
    if (rango.desde) params = params.set('desde', rango.desde);
    if (rango.hasta) params = params.set('hasta', rango.hasta);
    return params;
  }

  /** Publicaciones realizadas por cada usuario (gráfico de barras). */
  publicacionesPorUsuario(rango: RangoFechas): Observable<FilaEstadistica[]> {
    return this.http.get<FilaEstadistica[]>(
      `${this.apiUrl}/publicaciones-por-usuario`,
      { params: this.params(rango) },
    );
  }

  /** Comentarios realizados por día (gráfico de líneas). */
  comentariosPorDia(rango: RangoFechas): Observable<FilaEstadistica[]> {
    return this.http.get<FilaEstadistica[]>(
      `${this.apiUrl}/comentarios-por-dia`,
      { params: this.params(rango) },
    );
  }

  /** Comentarios en cada publicación (gráfico de torta). */
  comentariosPorPublicacion(rango: RangoFechas): Observable<FilaEstadistica[]> {
    return this.http.get<FilaEstadistica[]>(
      `${this.apiUrl}/comentarios-por-publicacion`,
      { params: this.params(rango) },
    );
  }
}
