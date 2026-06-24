import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  protected readonly noti = inject(NotificacionService);

  // Ejecuta la acción confirmada y cierra el modal.
  confirmar(): void {
    this.noti.actual()?.onConfirm?.();
    this.noti.cerrar();
  }
}
