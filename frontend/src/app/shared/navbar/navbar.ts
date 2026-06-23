import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Inicial del usuario para el avatar cuando no tiene foto. */
  inicial(): string {
    const u = this.auth.usuario();
    if (!u) return '?';
    return (u.nombre?.[0] ?? u.nombreUsuario?.[0] ?? '?').toUpperCase();
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
