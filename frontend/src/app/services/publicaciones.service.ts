import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Publicacion, RespuestaListado } from '../models/publicacion.model';

export interface OpcionesListado {
  orden?: 'fecha' | 'meGusta';
  usuario?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/publicaciones`;

  listar(opts: OpcionesListado = {}): Observable<RespuestaListado> {
    let params = new HttpParams();
    if (opts.orden) params = params.set('orden', opts.orden);
    if (opts.usuario) params = params.set('usuario', opts.usuario);
    if (opts.offset != null) params = params.set('offset', String(opts.offset));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    return this.http.get<RespuestaListado>(this.url, { params });
  }

  crear(datos: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string, usuarioId: string): Observable<{ mensaje: string }> {
    // El id del usuario va en el body (hasta el Sprint 3 que usa JWT).
    return this.http.delete<{ mensaje: string }>(`${this.url}/${id}`, {
      body: { usuarioId },
    });
  }

  darMeGusta(id: string, usuarioId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, { usuarioId });
  }

  quitarMeGusta(id: string, usuarioId: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`, {
      body: { usuarioId },
    });
  }
}
