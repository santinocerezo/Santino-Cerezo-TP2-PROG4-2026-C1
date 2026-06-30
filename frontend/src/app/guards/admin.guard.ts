import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Guard de administrador (Sprint 4): el dashboard solo está disponible para
 * usuarios con perfil "administrador". Si no lo es, lo manda a publicaciones.
 * Se usa junto con authGuard (primero hay que estar logueado).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const noti = inject(NotificacionService);

  if (auth.usuario()?.perfil === 'administrador') return true;

  noti.error('Esta sección es solo para administradores.', 'Acceso denegado');
  router.navigate(['/publicaciones']);
  return false;
};
