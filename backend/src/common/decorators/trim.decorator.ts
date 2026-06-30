import { Transform } from 'class-transformer';

/**
 * Recorta los espacios al inicio y al final ANTES de validar.
 * Así, un valor con solo espacios ("   ") queda como cadena vacía y los
 * validadores (@IsNotEmpty, @MinLength, etc.) devuelven un 400 claro en
 * español, en lugar de pasar la validación y romper más adelante en la
 * base de datos (que también recorta) provocando un 500 sin explicación.
 */
export function Trim() {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}
