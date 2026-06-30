import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia (Sprint 4): recorta un texto largo y le agrega "…" al final.
 * El límite por defecto es 120 caracteres.
 *
 * Uso: {{ publicacion.descripcion | truncar }}
 *      {{ publicacion.descripcion | truncar: 60 }}
 */
@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(valor: string | null | undefined, limite = 120): string {
    if (!valor) return '';
    if (valor.length <= limite) return valor;
    return valor.slice(0, limite).trimEnd() + '…';
  }
}
