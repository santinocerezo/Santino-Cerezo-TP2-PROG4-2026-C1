import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  @Input({ required: true }) publicacion!: Publicacion;

  // El padre maneja las acciones (así el estado vive en un solo lugar).
  @Output() meGusta = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

  private readonly auth = inject(AuthService);

  estaLogueado(): boolean {
    return this.auth.estaLogueado();
  }

  /** ¿El usuario actual ya dio me gusta a esta publicación? */
  yaDiMeGusta(): boolean {
    const yo = this.auth.usuario();
    return !!yo && this.publicacion.meGusta?.includes(yo._id);
  }

  /** Puede eliminar si es el autor o un administrador. */
  puedeEliminar(): boolean {
    const yo = this.auth.usuario();
    if (!yo) return false;
    return this.publicacion.autor?._id === yo._id || yo.perfil === 'administrador';
  }

  inicialAutor(): string {
    const a = this.publicacion.autor;
    return (a?.nombre?.[0] ?? a?.nombreUsuario?.[0] ?? '?').toUpperCase();
  }
}
