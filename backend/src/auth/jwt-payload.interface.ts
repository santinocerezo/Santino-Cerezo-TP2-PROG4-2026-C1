import { Perfil } from '../users/schemas/user.schema';

// Datos que viajan firmados dentro del token JWT.
// Identifican al usuario (id/correo/nombre) y su rol (perfil).
export interface JwtPayload {
  sub: string; // id del usuario en MongoDB
  correo: string;
  nombreUsuario: string;
  perfil: Perfil;
}
