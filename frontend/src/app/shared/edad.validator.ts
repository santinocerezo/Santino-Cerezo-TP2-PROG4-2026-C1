import { AbstractControl, ValidationErrors } from '@angular/forms';

export const EDAD_MINIMA = 13;
export const EDAD_MAXIMA = 120;

/** Devuelve la fecha (YYYY-MM-DD) de hace `anios` años desde hoy. */
export function fechaHaceAnios(anios: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - anios);
  return d.toISOString().slice(0, 10);
}

/**
 * Validador de Reactive Forms para la fecha de nacimiento:
 * la edad debe estar entre 13 y 120 años (no menor a 13 ni mayor a 120).
 * El vacío lo maneja Validators.required, no este validador.
 */
export function edadEntre13y120(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;

  if (edad < EDAD_MINIMA) return { menorEdad: true };
  if (edad > EDAD_MAXIMA) return { edadInvalida: true };
  return null;
}
