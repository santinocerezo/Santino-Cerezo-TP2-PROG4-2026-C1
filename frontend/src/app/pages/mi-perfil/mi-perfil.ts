import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterLink, DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly pubService = inject(PublicacionesService);

  protected readonly misPublicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(false);

  ngOnInit(): void {
    const yo = this.auth.usuario();
    if (!yo) return;
    this.cargando.set(true);
    // Últimas 3 publicaciones del usuario.
    this.pubService.listar({ usuario: yo._id, orden: 'fecha', limit: 3 }).subscribe({
      next: (resp) => {
        this.misPublicaciones.set(resp.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  inicial(): string {
    const u = this.auth.usuario();
    if (!u) return '?';
    return (u.nombre?.[0] ?? u.nombreUsuario?.[0] ?? '?').toUpperCase();
  }
}
