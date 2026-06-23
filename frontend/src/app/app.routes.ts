import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';

// Sprint 1: navegación libre entre las 4 pantallas (sin guards de acceso).
export const routes: Routes = [
  // La raíz muestra Publicaciones directamente (sin que aparezca /publicaciones en la URL).
  { path: '', component: Publicaciones, title: 'Publicaciones' },
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'registro', component: Registro, title: 'Crear cuenta' },
  { path: 'mi-perfil', component: MiPerfil, title: 'Mi perfil' },
  { path: '**', redirectTo: '' },
];
