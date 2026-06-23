import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly CLAVE = 'redsocial_usuario';

  // Estado del usuario logueado (se inicializa desde localStorage).
  private readonly _usuario = signal<Usuario | null>(this.leerGuardado());

  /** Usuario actual (signal de solo lectura para usar en los componentes). */
  readonly usuario = this._usuario.asReadonly();
  /** true si hay un usuario logueado. */
  readonly estaLogueado = computed(() => this._usuario() !== null);

  /** Registro de un nuevo usuario (multipart/form-data con la imagen). */
  registro(datos: FormData): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/registro`, datos)
      .pipe(tap((resp) => this.guardarSesion(resp.usuario)));
  }

  /** Login con correo o nombre de usuario + contraseña. */
  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/login`, { identificador, password })
      .pipe(tap((resp) => this.guardarSesion(resp.usuario)));
  }

  /** Cierra la sesión local. */
  logout(): void {
    localStorage.removeItem(this.CLAVE);
    this._usuario.set(null);
  }

  private guardarSesion(usuario: Usuario): void {
    localStorage.setItem(this.CLAVE, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private leerGuardado(): Usuario | null {
    const dato = localStorage.getItem(this.CLAVE);
    return dato ? (JSON.parse(dato) as Usuario) : null;
  }
}
