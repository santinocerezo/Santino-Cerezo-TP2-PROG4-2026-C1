import { Usuario } from './usuario.model';

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  autor: Usuario; // viene "populado" desde el backend
  meGusta: string[]; // ids de los usuarios que dieron me gusta
  cantidadMeGusta: number;
  eliminado: boolean;
  createdAt: string;
  updatedAt: string;
}

// Respuesta del listado paginado.
export interface RespuestaListado {
  items: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}
