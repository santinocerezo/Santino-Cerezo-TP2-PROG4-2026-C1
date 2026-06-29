import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, RespuestaComentarios } from '../models/comentario.model';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/publicaciones`;

  /** Lista paginada de comentarios de una publicación (recientes primero). */
  listar(
    publicacionId: string,
    offset = 0,
    limit = 5,
  ): Observable<RespuestaComentarios> {
    const params = new HttpParams()
      .set('offset', String(offset))
      .set('limit', String(limit));
    return this.http.get<RespuestaComentarios>(
      `${this.base}/${publicacionId}/comentarios`,
      { params },
    );
  }

  /** Agrega un comentario (el autor lo toma el backend del token). */
  crear(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(
      `${this.base}/${publicacionId}/comentarios`,
      { mensaje },
    );
  }

  /** Edita el mensaje de un comentario propio. */
  editar(comentarioId: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(
      `${environment.apiUrl}/comentarios/${comentarioId}`,
      { mensaje },
    );
  }
}
