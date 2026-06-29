import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Interceptor de autenticación (Sprint 3):
 * 1) Si hay token, lo agrega en el header "Authorization: Bearer <token>".
 * 2) Si una petición devuelve 401, cierra la sesión y redirige al login
 *    (salvo en las rutas de /auth, que manejan el error por su cuenta).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const noti = inject(NotificacionService);

  const token = auth.obtenerToken();
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const esRutaAuth = req.url.includes('/auth/');

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esRutaAuth) {
        auth.logout();
        noti.info('Tu sesión expiró. Volvé a iniciar sesión.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
