import { Routes } from '@angular/router';
import { Cargando } from './pages/cargando/cargando';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { PublicacionDetalle } from './pages/publicacion-detalle/publicacion-detalle';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardUsuarios } from './pages/dashboard/usuarios/usuarios';
import { DashboardEstadisticas } from './pages/dashboard/estadisticas/estadisticas';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Sprint 3: la raíz es una pantalla de carga que valida el token y redirige.
// Las pantallas internas quedan protegidas por authGuard (solo logueados).
export const routes: Routes = [
  { path: '', component: Cargando, title: 'Cargando...' },
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'registro', component: Registro, title: 'Crear cuenta' },
  {
    path: 'publicaciones',
    component: Publicaciones,
    title: 'Publicaciones',
    canActivate: [authGuard],
  },
  {
    path: 'publicaciones/:id',
    component: PublicacionDetalle,
    title: 'Publicación',
    canActivate: [authGuard],
  },
  {
    path: 'mi-perfil',
    component: MiPerfil,
    title: 'Mi perfil',
    canActivate: [authGuard],
  },
  // Sprint 4: panel de administración. Solo logueados Y administradores.
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: DashboardUsuarios, title: 'Usuarios' },
      {
        path: 'estadisticas',
        component: DashboardEstadisticas,
        title: 'Estadísticas',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
