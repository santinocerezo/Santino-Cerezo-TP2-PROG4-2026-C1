import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Publicacion } from '../../models/publicacion.model';
import { PublicacionCard } from '../../shared/publicacion-card/publicacion-card';

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, RouterLink, PublicacionCard],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly pubService = inject(PublicacionesService);
  private readonly noti = inject(NotificacionService);
  private readonly fb = inject(FormBuilder);

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly total = signal(0);
  protected readonly orden = signal<'fecha' | 'meGusta'>('fecha');
  protected readonly offset = signal(0);
  protected readonly cargando = signal(false);
  protected readonly creando = signal(false);
  protected readonly archivo = signal<File | null>(null);
  protected readonly preview = signal<string | null>(null);
  protected readonly mostrarFormulario = signal(false);

  protected readonly LIMIT = 5;

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.cargar();
  }

  paginaActual(): number {
    return Math.floor(this.offset() / this.LIMIT) + 1;
  }
  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total() / this.LIMIT));
  }

  cargar(): void {
    this.cargando.set(true);
    this.pubService
      .listar({ orden: this.orden(), offset: this.offset(), limit: this.LIMIT })
      .subscribe({
        next: (resp) => {
          this.publicaciones.set(resp.items);
          this.total.set(resp.total);
          this.cargando.set(false);
        },
        error: (e) => {
          this.cargando.set(false);
          this.noti.errorHttp(e, 'No se pudieron cargar las publicaciones');
        },
      });
  }

  cambiarOrden(nuevo: 'fecha' | 'meGusta'): void {
    if (this.orden() === nuevo) return;
    this.orden.set(nuevo);
    this.offset.set(0);
    this.cargar();
  }

  paginaAnterior(): void {
    if (this.offset() > 0) {
      this.offset.set(Math.max(0, this.offset() - this.LIMIT));
      this.cargar();
    }
  }
  paginaSiguiente(): void {
    if (this.offset() + this.LIMIT < this.total()) {
      this.offset.set(this.offset() + this.LIMIT);
      this.cargar();
    }
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

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const yo = this.auth.usuario();
    if (!yo) {
      this.noti.info('Iniciá sesión para publicar.');
      return;
    }
    this.creando.set(true);
    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('titulo', v.titulo);
    fd.append('descripcion', v.descripcion);
    fd.append('autor', yo._id);
    const f = this.archivo();
    if (f) fd.append('imagen', f);

    this.pubService.crear(fd).subscribe({
      next: () => {
        this.creando.set(false);
        this.form.reset();
        this.archivo.set(null);
        this.preview.set(null);
        this.mostrarFormulario.set(false);
        this.noti.exito('Tu publicación fue creada.');
        // Volvemos al inicio del listado ordenado por fecha.
        this.orden.set('fecha');
        this.offset.set(0);
        this.cargar();
      },
      error: (e) => {
        this.creando.set(false);
        this.noti.errorHttp(e, 'No se pudo crear la publicación');
      },
    });
  }

  alternarMeGusta(pub: Publicacion): void {
    const yo = this.auth.usuario();
    if (!yo) {
      this.noti.info('Iniciá sesión para dar me gusta.');
      return;
    }
    const obs = pub.meGusta.includes(yo._id)
      ? this.pubService.quitarMeGusta(pub._id, yo._id)
      : this.pubService.darMeGusta(pub._id, yo._id);

    obs.subscribe({
      next: (actualizada) => {
        this.publicaciones.update((arr) =>
          arr.map((p) => (p._id === actualizada._id ? actualizada : p)),
        );
      },
      error: (e) => this.noti.errorHttp(e),
    });
  }

  pedirEliminar(pub: Publicacion): void {
    const yo = this.auth.usuario();
    if (!yo) return;
    this.noti.confirmar('¿Seguro que querés eliminar esta publicación?', () => {
      this.pubService.eliminar(pub._id, yo._id).subscribe({
        next: () => {
          this.publicaciones.update((arr) => arr.filter((p) => p._id !== pub._id));
          this.total.update((t) => Math.max(0, t - 1));
          this.noti.exito('Publicación eliminada.');
        },
        error: (e) => this.noti.errorHttp(e),
      });
    });
  }
}
