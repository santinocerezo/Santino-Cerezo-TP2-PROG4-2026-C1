import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly CLAVE_USUARIO = 'redsocial_usuario';
  private readonly CLAVE_TOKEN = 'redsocial_token';

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
      .pipe(tap((resp) => this.guardarSesion(resp)));
  }

  /** Login con correo o nombre de usuario + contraseña. */
  login(identificador: string, password: string): Observable<RespuestaAuth> {
    return this.http
      .post<RespuestaAuth>(`${this.apiUrl}/login`, { identificador, password })
      .pipe(tap((resp) => this.guardarSesion(resp)));
  }

  /** Valida el token guardado contra el backend y refresca los datos del usuario. */
  autorizar(): Observable<{ usuario: Usuario }> {
    return this.http
      .post<{ usuario: Usuario }>(`${this.apiUrl}/autorizar`, {})
      .pipe(tap((resp) => this.guardarUsuario(resp.usuario)));
  }

  /** Pide un token nuevo (misma identidad, +15 minutos) y lo guarda. */
  refrescar(): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/refrescar`, {})
      .pipe(tap((resp) => this.guardarToken(resp.token)));
  }

  /** Cierra la sesión local. */
  logout(): void {
    localStorage.removeItem(this.CLAVE_USUARIO);
    localStorage.removeItem(this.CLAVE_TOKEN);
    this._usuario.set(null);
  }

  /** Token JWT actual (lo usa el interceptor para autenticar las peticiones). */
  obtenerToken(): string | null {
    return localStorage.getItem(this.CLAVE_TOKEN);
  }

  private guardarSesion(resp: RespuestaAuth): void {
    this.guardarToken(resp.token);
    this.guardarUsuario(resp.usuario);
  }

  private guardarUsuario(usuario: Usuario): void {
    localStorage.setItem(this.CLAVE_USUARIO, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private guardarToken(token: string): void {
    localStorage.setItem(this.CLAVE_TOKEN, token);
  }

  private leerGuardado(): Usuario | null {
    const dato = localStorage.getItem(this.CLAVE_USUARIO);
    return dato ? (JSON.parse(dato) as Usuario) : null;
  }
}
