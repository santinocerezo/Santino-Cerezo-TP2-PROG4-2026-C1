import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterLink, DatePipe],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  protected readonly auth = inject(AuthService);

  inicial(): string {
    const u = this.auth.usuario();
    if (!u) return '?';
    return (u.nombre?.[0] ?? u.nombreUsuario?.[0] ?? '?').toUpperCase();
  }
}
