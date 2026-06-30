import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { NotificacionService } from './notificacion.service';

/**
 * Maneja el contador de sesión (Sprint 3):
 * - El token vence a los 15 minutos.
 * - A los 10 minutos (cuando quedan 5) aparece un modal preguntando si se
 *   desea seguir conectado. Si el usuario acepta, se refresca el token.
 * - Si la sesión llega a 0, se cierra y se redirige al login.
 * El contador arranca/se detiene solo según el estado de login.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly auth = inject(AuthService);
  private readonly noti = inject(NotificacionService);
  private readonly router = inject(Router);

  // El token del backend vence a los 15 minutos (Sprint 3).
  private readonly DURACION_MS = 15 * 60 * 1000; // la sesión dura 15 minutos
  private readonly AVISO_RESTANTE_S = 5 * 60; // avisar cuando queden 5 minutos

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private vencimiento = 0;
  private avisoMostrado = false;
  private refrescando = false;

  /** Segundos que faltan para que venza la sesión. */
  readonly restanteSegundos = signal(0);

  /** Tiempo restante con formato m:ss para mostrar en la barra. */
  readonly restanteTexto = computed(() => {
    const s = Math.max(0, this.restanteSegundos());
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${m}:${seg.toString().padStart(2, '0')}`;
  });

  constructor() {
    // Arranca el contador al loguearse y lo detiene al cerrar sesión.
    effect(() => {
      if (this.auth.estaLogueado()) this.iniciar();
      else this.detener();
    });
  }

  /** (Re)inicia el contador: 15 minutos a partir de ahora. */
  iniciar(): void {
    this.detener();
    this.vencimiento = Date.now() + this.DURACION_MS;
    this.avisoMostrado = false;
    this.tick();
    this.intervalo = setInterval(() => this.tick(), 1000);
  }

  /** Detiene el contador. */
  detener(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
    this.restanteSegundos.set(0);
  }

  private tick(): void {
    const restante = Math.round((this.vencimiento - Date.now()) / 1000);
    this.restanteSegundos.set(restante);

    if (restante <= 0) {
      this.expirar();
      return;
    }
    if (restante <= this.AVISO_RESTANTE_S && !this.avisoMostrado) {
      this.avisoMostrado = true;
      this.avisar();
    }
  }

  private avisar(): void {
    this.noti.confirmar(
      'Te quedan 5 minutos de sesión. ¿Querés seguir conectado?',
      () => this.extender(),
      'Tu sesión está por vencer',
    );
  }

  private extender(): void {
    if (this.refrescando) return;
    this.refrescando = true;
    this.auth.refrescar().subscribe({
      next: () => {
        this.refrescando = false;
        this.iniciar();
        this.noti.exito('Tu sesión se extendió 15 minutos más.');
      },
      error: () => {
        this.refrescando = false;
        this.expirar();
      },
    });
  }

  private expirar(): void {
    this.detener();
    this.auth.logout();
    this.noti.info('Tu sesión expiró. Iniciá sesión nuevamente.');
    this.router.navigate(['/login']);
  }
}
