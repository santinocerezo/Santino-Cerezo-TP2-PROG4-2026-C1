import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';

// Sprint 1: navegación libre entre las 4 pantallas (sin guards de acceso).
export const routes: Routes = [
  { path: '', redirectTo: 'publicaciones', pathMatch: 'full' },
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'registro', component: Registro, title: 'Crear cuenta' },
  { path: 'publicaciones', component: Publicaciones, title: 'Publicaciones' },
  { path: 'mi-perfil', component: MiPerfil, title: 'Mi perfil' },
  { path: '**', redirectTo: 'publicaciones' },
];
