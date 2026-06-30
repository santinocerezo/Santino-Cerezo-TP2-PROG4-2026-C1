export type Perfil = 'usuario' | 'administrador';

// Representa al usuario tal como lo devuelve el backend (sin la contraseña).
export interface Usuario {
  _id: string;
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoPerfil: string;
  perfil: Perfil;
  eliminado: boolean;
  // Última vez que cambió el nombre de usuario (para el cooldown de 15 días).
  nombreUsuarioActualizadoEn?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Respuesta de los endpoints /auth/registro y /auth/login.
export interface RespuestaAuth {
  mensaje: string;
  usuario: Usuario;
  token: string; // JWT (Sprint 3)
}
