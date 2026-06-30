import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Pantalla de carga inicial (Sprint 3).
 * Al iniciar la aplicación valida el token contra /auth/autorizar:
 * - si es válido, va a Publicaciones;
 * - si no, va al Login.
 */
@Component({
  selector: 'app-cargando',
  imports: [],
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.obtenerToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.autorizar().subscribe({
      next: () => this.router.navigate(['/publicaciones']),
      error: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
