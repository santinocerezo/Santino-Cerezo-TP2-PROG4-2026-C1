import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';

/**
 * Directiva propia (Sprint 4): emite un evento cuando se hace click FUERA del
 * elemento. Sirve para cerrar menús/desplegables al clickear en cualquier
 * otro lado.
 *
 * Uso: <div appClickAfuera (clickAfuera)="abierto = false"> ... </div>
 */
@Directive({ selector: '[appClickAfuera]' })
export class ClickAfueraDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Output() clickAfuera = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  alClickDocumento(event: MouseEvent): void {
    const destino = event.target as Node;
    if (!this.el.nativeElement.contains(destino)) {
      this.clickAfuera.emit();
    }
  }
}
