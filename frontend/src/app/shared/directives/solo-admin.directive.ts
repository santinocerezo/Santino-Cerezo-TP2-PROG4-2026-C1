import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';

/**
 * Directiva estructural propia (Sprint 4): muestra el elemento solo si el
 * usuario logueado es administrador. Reacciona a los cambios de sesión
 * (signal de AuthService), así que aparece/desaparece al loguearse o salir.
 *
 * Uso: <a *appSoloAdmin routerLink="/dashboard">Panel</a>
 */
@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdminDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);
  private visible = false;

  constructor() {
    effect(() => {
      const esAdmin = this.auth.usuario()?.perfil === 'administrador';
      if (esAdmin && !this.visible) {
        this.vcr.createEmbeddedView(this.tpl);
        this.visible = true;
      } else if (!esAdmin && this.visible) {
        this.vcr.clear();
        this.visible = false;
      }
    });
  }
}
