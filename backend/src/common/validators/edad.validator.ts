import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const EDAD_MINIMA = 13;
export const EDAD_MAXIMA = 120;

// Calcula la edad (en años cumplidos) a partir de una fecha de nacimiento.
function calcularEdad(fecha: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;
  return edad;
}

@ValidatorConstraint({ name: 'edadValida', async: false })
export class EdadValidaConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const fecha = new Date(value);
    if (isNaN(fecha.getTime())) return false;
    const edad = calcularEdad(fecha);
    return edad >= EDAD_MINIMA && edad <= EDAD_MAXIMA;
  }

  defaultMessage(): string {
    return `La edad debe estar entre ${EDAD_MINIMA} y ${EDAD_MAXIMA} años`;
  }
}

/**
 * Valida que la fecha de nacimiento corresponda a una edad de entre 13 y 120
 * años (no menor a 13 ni mayor a 120).
 */
export function EsEdadValida(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: EdadValidaConstraint,
    });
  };
}
