import { Usuario } from './usuario.model';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: Usuario; // viene "populado" desde el backend
  mensaje: string;
  modificado: boolean; // true si el autor lo editó
  createdAt: string;
  updatedAt: string;
}

// Respuesta del listado paginado de comentarios.
export interface RespuestaComentarios {
  items: Comentario[];
  total: number;
  offset: number;
  limit: number;
}
