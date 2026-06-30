import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

interface RespuestaUsuario {
  mensaje: string;
  usuario: Usuario;
}

/**
 * Servicio de administración de usuarios (Sprint 4). Todas las rutas son
 * solo para administradores; el backend valida el rol con el token.
 */
@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  /** Listado completo de usuarios. */
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /** Alta de un usuario nuevo (multipart: puede incluir foto). */
  crear(datos: FormData): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(this.apiUrl, datos);
  }

  /** Baja lógica: deshabilita al usuario. */
  deshabilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.delete<RespuestaUsuario>(`${this.apiUrl}/${id}`);
  }

  /** Alta lógica: rehabilita a un usuario deshabilitado. */
  habilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.apiUrl}/${id}/habilitar`, {});
  }
}
