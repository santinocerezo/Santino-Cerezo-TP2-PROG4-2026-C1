import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly noti = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    identificador: ['', [Validators.required]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        // Al menos una mayúscula y un número.
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
  });

  /** Indica si un campo es inválido y ya fue tocado (para mostrar el error). */
  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    const { identificador, password } = this.form.getRawValue();

    this.auth.login(identificador, password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.noti.errorHttp(err, 'No se pudo iniciar sesión');
      },
    });
  }
}
