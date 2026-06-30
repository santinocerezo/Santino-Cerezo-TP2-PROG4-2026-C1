import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe propia (Sprint 4): convierte una fecha en un texto relativo,
 * por ejemplo "hace 5 minutos", "hace 2 días" o "recién".
 *
 * Uso: {{ publicacion.createdAt | tiempoRelativo }}
 */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(valor: string | Date | null | undefined): string {
    if (!valor) return '';
    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return '';

    const segundos = Math.floor((Date.now() - fecha.getTime()) / 1000);
    if (segundos < 0) return 'recién';
    if (segundos < 10) return 'recién';
    if (segundos < 60) return `hace ${segundos} segundos`;

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    const meses = Math.floor(dias / 30);
    if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

    const anios = Math.floor(meses / 12);
    return `hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
}
