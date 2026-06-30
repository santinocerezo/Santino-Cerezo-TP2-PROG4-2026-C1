import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ComentariosService } from '../../services/comentarios.service';
import { NotificacionService } from '../../services/notificacion.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { Comentario } from '../../models/comentario.model';
import { Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly pubService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly noti = inject(NotificacionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly publicacion = signal<Publicacion | null>(null);
  protected readonly cargandoPub = signal(true);

  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly totalComentarios = signal(0);
  protected readonly cargandoComentarios = signal(false);
  protected readonly enviando = signal(false);

  // Comentario que se está editando (su id) y el texto en edición.
  protected readonly editandoId = signal<string | null>(null);
  protected readonly textoEdicion = signal('');

  private readonly LIMIT = 5;
  private offset = 0;
  private id = '';

  protected readonly form = this.fb.nonNullable.group({
    mensaje: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.cargarPublicacion();
    this.cargarComentarios(true);
  }

  private cargarPublicacion(): void {
    this.cargandoPub.set(true);
    this.pubService.obtener(this.id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.cargandoPub.set(false);
      },
      error: (e) => {
        this.cargandoPub.set(false);
        this.noti.errorHttp(e, 'No se pudo cargar la publicación');
        this.router.navigate(['/publicaciones']);
      },
    });
  }

  cargarComentarios(reiniciar = false): void {
    if (reiniciar) {
      this.offset = 0;
      this.comentarios.set([]);
    }
    this.cargandoComentarios.set(true);
    this.comentariosService.listar(this.id, this.offset, this.LIMIT).subscribe({
      next: (resp) => {
        this.comentarios.update((arr) => [...arr, ...resp.items]);
        this.totalComentarios.set(resp.total);
        this.offset += resp.items.length;
        this.cargandoComentarios.set(false);
      },
      error: (e) => {
        this.cargandoComentarios.set(false);
        this.noti.errorHttp(e, 'No se pudieron cargar los comentarios');
      },
    });
  }

  hayMas(): boolean {
    return this.comentarios().length < this.totalComentarios();
  }

  comentar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const mensaje = this.form.getRawValue().mensaje.trim();
    this.comentariosService.crear(this.id, mensaje).subscribe({
      next: (nuevo) => {
        // El más reciente va arriba de todo.
        this.comentarios.update((arr) => [nuevo, ...arr]);
        this.totalComentarios.update((t) => t + 1);
        this.offset += 1; // mantenemos la paginación consistente
        this.form.reset();
        this.enviando.set(false);
      },
      error: (e) => {
        this.enviando.set(false);
        this.noti.errorHttp(e, 'No se pudo publicar el comentario');
      },
    });
  }

  // ----- Edición de comentarios propios -----
  puedeEditar(c: Comentario): boolean {
    const yo = this.auth.usuario();
    return !!yo && c.autor?._id === yo._id;
  }

  empezarEdicion(c: Comentario): void {
    this.editandoId.set(c._id);
    this.textoEdicion.set(c.mensaje);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.textoEdicion.set('');
  }

  guardarEdicion(c: Comentario): void {
    const mensaje = this.textoEdicion().trim();
    if (!mensaje) return;
    this.comentariosService.editar(c._id, mensaje).subscribe({
      next: (actualizado) => {
        this.comentarios.update((arr) =>
          arr.map((x) => (x._id === actualizado._id ? actualizado : x)),
        );
        this.cancelarEdicion();
      },
      error: (e) => this.noti.errorHttp(e, 'No se pudo editar el comentario'),
    });
  }

  // ----- Acciones sobre la publicación -----
  yaDiMeGusta(): boolean {
    const yo = this.auth.usuario();
    const pub = this.publicacion();
    return !!yo && !!pub && pub.meGusta.includes(yo._id);
  }

  puedeEliminar(): boolean {
    const yo = this.auth.usuario();
    const pub = this.publicacion();
    if (!yo || !pub) return false;
    return pub.autor?._id === yo._id || yo.perfil === 'administrador';
  }

  alternarMeGusta(): void {
    const pub = this.publicacion();
    if (!pub) return;
    const obs = this.yaDiMeGusta()
      ? this.pubService.quitarMeGusta(pub._id)
      : this.pubService.darMeGusta(pub._id);
    obs.subscribe({
      next: (actualizada) => this.publicacion.set(actualizada),
      error: (e) => this.noti.errorHttp(e),
    });
  }

  pedirEliminar(): void {
    const pub = this.publicacion();
    if (!pub) return;
    this.noti.confirmar('¿Seguro que querés eliminar esta publicación?', () => {
      this.pubService.eliminar(pub._id).subscribe({
        next: () => {
          this.noti.exito('Publicación eliminada.');
          this.router.navigate(['/publicaciones']);
        },
        error: (e) => this.noti.errorHttp(e),
      });
    });
  }

  inicial(u: { nombre?: string; nombreUsuario?: string } | undefined): string {
    return (u?.nombre?.[0] ?? u?.nombreUsuario?.[0] ?? '?').toUpperCase();
  }

  esComentarioInvalido(): boolean {
    const c = this.form.get('mensaje');
    return !!c && c.invalid && (c.dirty || c.touched);
  }
}
