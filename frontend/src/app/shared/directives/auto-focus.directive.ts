import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Directiva propia (Sprint 4): pone el foco automáticamente en el elemento
 * apenas se muestra. Útil en el primer campo de un formulario o modal.
 *
 * Uso: <input appAutoFocus />
 */
@Directive({ selector: '[appAutoFocus]' })
export class AutoFocusDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    // setTimeout para asegurar que el elemento ya está renderizado y visible.
    setTimeout(() => this.el.nativeElement.focus());
  }
}
