import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';
import { edadEntre13y120, fechaHaceAnios } from '../../shared/edad.validator';

const DIAS_COOLDOWN_USUARIO = 15;
const MS_DIA = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-mi-perfil',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly pubService = inject(PublicacionesService);
  private readonly noti = inject(NotificacionService);
  private readonly fb = inject(FormBuilder);

  protected readonly misPublicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(false);

  // Estado del panel de edición.
  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly archivo = signal<File | null>(null);
  protected readonly preview = signal<string | null>(null);

  // Límites para el input date: entre 120 y 13 años atrás.
  protected readonly minFechaNac = fechaHaceAnios(120);
  protected readonly maxFechaNac = fechaHaceAnios(13);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    fechaNacimiento: ['', [Validators.required, edadEntre13y120]],
    descripcion: ['', [Validators.maxLength(300)]],
  });

  /** Días que faltan para poder volver a cambiar el nombre de usuario. */
  protected readonly diasParaCambiarUsuario = computed(() => {
    const ultimo = this.auth.usuario()?.nombreUsuarioActualizadoEn;
    if (!ultimo) return 0;
    const restante = DIAS_COOLDOWN_USUARIO * MS_DIA - (Date.now() - new Date(ultimo).getTime());
    return restante > 0 ? Math.ceil(restante / MS_DIA) : 0;
  });

  /** true si todavía no puede cambiar el nombre de usuario. */
  protected readonly usuarioBloqueado = computed(() => this.diasParaCambiarUsuario() > 0);

  ngOnInit(): void {
    const yo = this.auth.usuario();
    if (!yo) return;
    this.cargando.set(true);
    // Últimas 3 publicaciones del usuario.
    this.pubService.listar({ usuario: yo._id, orden: 'fecha', limit: 3 }).subscribe({
      next: (resp) => {
        this.misPublicaciones.set(resp.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  inicial(): string {
    const u = this.auth.usuario();
    if (!u) return '?';
    return (u.nombre?.[0] ?? u.nombreUsuario?.[0] ?? '?').toUpperCase();
  }

  /** Abre el panel y precarga el formulario con los datos actuales. */
  abrirEdicion(): void {
    const u = this.auth.usuario();
    if (!u) return;
    this.form.reset({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      nombreUsuario: u.nombreUsuario,
      fechaNacimiento: u.fechaNacimiento?.slice(0, 10) ?? '',
      descripcion: u.descripcion ?? '',
    });
    // Si está en cooldown, el nombre de usuario no se puede editar.
    if (this.usuarioBloqueado()) this.form.controls.nombreUsuario.disable();
    else this.form.controls.nombreUsuario.enable();

    this.archivo.set(null);
    this.preview.set(null);
    this.editando.set(true);
  }

  cancelar(): void {
    this.editando.set(false);
  }

  esInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.dirty || c.touched);
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

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('nombre', v.nombre);
    fd.append('apellido', v.apellido);
    fd.append('correo', v.correo);
    // Solo mandamos el nombre de usuario si no está bloqueado por cooldown.
    if (!this.usuarioBloqueado()) fd.append('nombreUsuario', v.nombreUsuario);
    fd.append('fechaNacimiento', v.fechaNacimiento);
    fd.append('descripcion', v.descripcion ?? '');

    const foto = this.archivo();
    if (foto) fd.append('fotoPerfil', foto);

    this.auth.actualizarPerfil(fd).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editando.set(false);
        this.noti.exito('Tu perfil se actualizó correctamente.');
      },
      error: (err) => {
        this.guardando.set(false);
        this.noti.errorHttp(err, 'No se pudo actualizar el perfil');
      },
    });
  }
}
