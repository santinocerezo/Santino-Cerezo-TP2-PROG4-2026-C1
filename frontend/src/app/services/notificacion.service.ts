import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}

/**
 * Maneja el modal de notificaciones global.
 * Se usa en lugar de alert() (requisito de la consigna).
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  // null = no hay modal abierto.
  readonly actual = signal<Notificacion | null>(null);

  mostrar(tipo: TipoNotificacion, titulo: string, mensaje: string): void {
    this.actual.set({ tipo, titulo, mensaje });
  }

  exito(mensaje: string, titulo = '¡Listo!'): void {
    this.mostrar('exito', titulo, mensaje);
  }

  error(mensaje: string, titulo = 'Ocurrió un problema'): void {
    this.mostrar('error', titulo, mensaje);
  }

  info(mensaje: string, titulo = 'Información'): void {
    this.mostrar('info', titulo, mensaje);
  }

  /** Muestra el mensaje de error que devuelve el backend (string o array). */
  errorHttp(err: unknown, respaldo = 'No se pudo completar la operación'): void {
    const m = (err as { error?: { message?: string | string[] } })?.error?.message;
    const mensaje = Array.isArray(m) ? m.join('. ') : typeof m === 'string' ? m : respaldo;
    this.error(mensaje);
  }

  cerrar(): void {
    this.actual.set(null);
  }
}
