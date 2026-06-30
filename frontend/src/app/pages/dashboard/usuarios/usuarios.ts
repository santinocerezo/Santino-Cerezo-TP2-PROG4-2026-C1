import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { Usuario } from '../../../models/usuario.model';
import { edadEntre13y120, fechaHaceAnios } from '../../../shared/edad.validator';
import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';
import { InicialesPipe } from '../../../shared/pipes/iniciales.pipe';
import { TiempoRelativoPipe } from '../../../shared/pipes/tiempo-relativo.pipe';

// Validador a nivel grupo: la contraseña y su repetición deben coincidir.
function passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const repe = group.get('repetirPassword')?.value;
  return pass === repe ? null : { noCoinciden: true };
}

/**
 * Dashboard / Usuarios (Sprint 4). Lista los usuarios, permite crear nuevos
 * (eligiendo el perfil con radio buttons) y dar de alta/baja lógica.
 */
@Component({
  selector: 'app-dashboard-usuarios',
  imports: [
    ReactiveFormsModule,
    AutoFocusDirective,
    InicialesPipe,
    TiempoRelativoPipe,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class DashboardUsuarios implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);
  private readonly noti = inject(NotificacionService);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly cargando = signal(false);
  protected readonly creando = signal(false);
  protected readonly mostrarFormulario = signal(false);
  protected readonly archivo = signal<File | null>(null);
  protected readonly preview = signal<string | null>(null);

  // Límites para el input date: entre 120 y 13 años atrás.
  protected readonly minFechaNac = fechaHaceAnios(120);
  protected readonly maxFechaNac = fechaHaceAnios(13);

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
      fechaNacimiento: ['', [Validators.required, edadEntre13y120]],
      descripcion: ['', [Validators.maxLength(300)]],
      perfil: ['usuario' as 'usuario' | 'administrador', [Validators.required]],
    },
    { validators: passwordsCoinciden },
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.noti.errorHttp(e, 'No se pudo cargar el listado de usuarios');
      },
    });
  }

  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  get noCoinciden(): boolean {
    const repe = this.form.get('repetirPassword');
    return this.form.hasError('noCoinciden') && !!repe && (repe.dirty || repe.touched);
  }

  alternarFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
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

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creando.set(true);

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
    fd.append('perfil', v.perfil);
    const foto = this.archivo();
    if (foto) fd.append('fotoPerfil', foto);

    this.usuariosService.crear(fd).subscribe({
      next: () => {
        this.creando.set(false);
        this.form.reset({ perfil: 'usuario' });
        this.archivo.set(null);
        this.preview.set(null);
        this.mostrarFormulario.set(false);
        this.noti.exito('El usuario fue creado correctamente.');
        this.cargar();
      },
      error: (e) => {
        this.creando.set(false);
        this.noti.errorHttp(e, 'No se pudo crear el usuario');
      },
    });
  }

  pedirDeshabilitar(u: Usuario): void {
    this.noti.confirmar(
      `¿Deshabilitar a @${u.nombreUsuario}? No podrá ingresar a la aplicación.`,
      () => {
        this.usuariosService.deshabilitar(u._id).subscribe({
          next: (resp) => {
            this.reemplazar(resp.usuario);
            this.noti.exito('Usuario deshabilitado.');
          },
          error: (e) => this.noti.errorHttp(e),
        });
      },
      'Deshabilitar usuario',
    );
  }

  pedirHabilitar(u: Usuario): void {
    this.noti.confirmar(
      `¿Habilitar a @${u.nombreUsuario}? Volverá a poder ingresar.`,
      () => {
        this.usuariosService.habilitar(u._id).subscribe({
          next: (resp) => {
            this.reemplazar(resp.usuario);
            this.noti.exito('Usuario habilitado.');
          },
          error: (e) => this.noti.errorHttp(e),
        });
      },
      'Habilitar usuario',
    );
  }

  /** Reemplaza un usuario en la lista por su versión actualizada. */
  private reemplazar(actualizado: Usuario): void {
    this.usuarios.update((arr) =>
      arr.map((u) => (u._id === actualizado._id ? actualizado : u)),
    );
  }
}
