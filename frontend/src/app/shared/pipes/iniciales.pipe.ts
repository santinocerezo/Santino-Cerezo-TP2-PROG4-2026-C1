import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia (Sprint 4): toma uno o más textos (nombre, apellido o nombre de
 * usuario) y devuelve las iniciales en mayúscula para los avatares.
 *
 * Uso: {{ usuario.nombre + ' ' + usuario.apellido | iniciales }}  ->  "SC"
 */
@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '?';
    const palabras = valor.trim().split(/\s+/).filter(Boolean);
    if (palabras.length === 0) return '?';
    const iniciales = palabras
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
    return iniciales || '?';
  }
}
