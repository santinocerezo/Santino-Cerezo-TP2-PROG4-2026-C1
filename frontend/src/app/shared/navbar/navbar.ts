import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SesionService } from '../../services/sesion.service';
import { SoloAdminDirective } from '../directives/solo-admin.directive';
import { InicialesPipe } from '../pipes/iniciales.pipe';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SoloAdminDirective, InicialesPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
