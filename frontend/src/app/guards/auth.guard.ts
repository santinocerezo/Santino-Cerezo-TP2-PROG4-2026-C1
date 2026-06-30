import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de acceso: solo se puede entrar a la aplicación estando logueado.
 * Si no hay sesión, redirige al login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaLogueado()) return true;

  router.navigate(['/login']);
  return false;
};
