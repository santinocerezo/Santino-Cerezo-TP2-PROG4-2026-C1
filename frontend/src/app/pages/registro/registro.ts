import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

// Validador a nivel grupo: la contraseña y su repetición deben coincidir.
function passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const repe = group.get('repetirPassword')?.value;
  return pass === repe ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly noti = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly cargando = signal(false);
  protected readonly archivo = signal<File | null>(null);
  protected readonly preview = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: ['', [Validators.maxLength(300)]],
    },
    { validators: passwordsCoinciden },
  );

  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  /** ¿Las contraseñas no coinciden y el usuario ya tocó el campo repetir? */
  get noCoinciden(): boolean {
    const repe = this.form.get('repetirPassword');
    return this.form.hasError('noCoinciden') && !!repe && (repe.dirty || repe.touched);
  }

  alSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && !file.type.startsWith('image/')) {
      this.noti.error('El archivo debe ser una imagen.');
      input.value = '';
      return;
    }

    this.archivo.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.preview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.preview.set(null);
    }
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('nombre', v.nombre);
    fd.append('apellido', v.apellido);
    fd.append('correo', v.correo);
    fd.append('nombreUsuario', v.nombreUsuario);
    fd.append('password', v.password);
    fd.append('repetirPassword', v.repetirPassword);
    fd.append('fechaNacimiento', v.fechaNacimiento);
    fd.append('descripcion', v.descripcion ?? '');

    const foto = this.archivo();
    if (foto) fd.append('fotoPerfil', foto);

    this.auth.registro(fd).subscribe({
      next: () => {
        this.cargando.set(false);
        this.noti.exito('Tu cuenta fue creada correctamente. ¡Bienvenido/a!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.cargando.set(false);
        this.noti.errorHttp(err, 'No se pudo completar el registro');
      },
    });
  }
}
