import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { FilaEstadistica, RangoFechas } from '../../../models/estadistica.model';
import { ClickAfueraDirective } from '../../../shared/directives/click-afuera.directive';

// Chart.js necesita registrar sus componentes una sola vez.
Chart.register(...registerables);

// Devuelve una fecha (Date) en formato 'AAAA-MM-DD' local.
function aISO(fecha: Date): string {
  const off = fecha.getTimezoneOffset();
  return new Date(fecha.getTime() - off * 60_000).toISOString().slice(0, 10);
}
function haceDias(dias: number): string {
  const f = new Date();
  f.setDate(f.getDate() - dias);
  return aISO(f);
}

/**
 * Dashboard / Estadísticas (Sprint 4). Muestra 3 gráficos de distinto tipo
 * (barras, líneas y torta) con un rango de fechas elegible.
 */
@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [ReactiveFormsModule, ClickAfueraDirective],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class DashboardEstadisticas implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly estadisticas = inject(EstadisticasService);
  private readonly noti = inject(NotificacionService);

  private readonly canvasBarras =
    viewChild<ElementRef<HTMLCanvasElement>>('canvasBarras');
  private readonly canvasLineas =
    viewChild<ElementRef<HTMLCanvasElement>>('canvasLineas');
  private readonly canvasTorta =
    viewChild<ElementRef<HTMLCanvasElement>>('canvasTorta');

  private graficoBarras?: Chart;
  private graficoLineas?: Chart;
  private graficoTorta?: Chart;

  protected readonly cargando = signal(false);
  protected readonly menuAbierto = signal(false);
  // ¿Hay datos en cada gráfico? (para mostrar el mensaje "sin datos").
  protected readonly hayBarras = signal(true);
  protected readonly hayLineas = signal(true);
  protected readonly hayTorta = signal(true);

  // Rango por defecto: últimos 30 días.
  protected readonly form = this.fb.nonNullable.group({
    desde: [haceDias(30)],
    hasta: [aISO(new Date())],
  });

  private readonly PALETA = [
    '#8b5cf6', '#ec4899', '#22c55e', '#60a5fa', '#f59e0b',
    '#f87171', '#14b8a6', '#a78bfa', '#fb7185', '#34d399',
  ];

  ngAfterViewInit(): void {
    this.cargar();
  }

  ngOnDestroy(): void {
    this.graficoBarras?.destroy();
    this.graficoLineas?.destroy();
    this.graficoTorta?.destroy();
  }

  private rango(): RangoFechas {
    const v = this.form.getRawValue();
    return { desde: v.desde || undefined, hasta: v.hasta || undefined };
  }

  /** Aplica el rango elegido y recarga los 3 gráficos. */
  aplicar(): void {
    this.cargar();
  }

  /** Atajos de rango rápido (desde el desplegable). */
  rangoRapido(dias: number | 'todo'): void {
    this.menuAbierto.set(false);
    if (dias === 'todo') {
      this.form.setValue({ desde: '', hasta: '' });
    } else {
      this.form.setValue({ desde: haceDias(dias), hasta: aISO(new Date()) });
    }
    this.cargar();
  }

  private cargar(): void {
    const rango = this.rango();
    this.cargando.set(true);

    // Gráfico 1: publicaciones por usuario (barras).
    this.estadisticas.publicacionesPorUsuario(rango).subscribe({
      next: (filas) => {
        this.hayBarras.set(filas.length > 0);
        this.dibujarBarras(filas);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.noti.errorHttp(e, 'No se pudieron cargar las estadísticas');
      },
    });

    // Gráfico 2: comentarios por día (líneas).
    this.estadisticas.comentariosPorDia(rango).subscribe({
      next: (filas) => {
        this.hayLineas.set(filas.length > 0);
        this.dibujarLineas(filas);
      },
      error: (e) => this.noti.errorHttp(e),
    });

    // Gráfico 3: comentarios por publicación (torta).
    this.estadisticas.comentariosPorPublicacion(rango).subscribe({
      next: (filas) => {
        this.hayTorta.set(filas.length > 0);
        this.dibujarTorta(filas);
      },
      error: (e) => this.noti.errorHttp(e),
    });
  }

  private dibujarBarras(filas: FilaEstadistica[]): void {
    const canvas = this.canvasBarras()?.nativeElement;
    if (!canvas) return;
    this.graficoBarras?.destroy();
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: filas.map((f) => f.etiqueta),
        datasets: [
          {
            label: 'Publicaciones',
            data: filas.map((f) => f.cantidad),
            backgroundColor: '#8b5cf6',
            borderRadius: 6,
          },
        ],
      },
      options: this.opcionesBase(false),
    };
    this.graficoBarras = new Chart(canvas, config);
  }

  private dibujarLineas(filas: FilaEstadistica[]): void {
    const canvas = this.canvasLineas()?.nativeElement;
    if (!canvas) return;
    this.graficoLineas?.destroy();
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: filas.map((f) => f.etiqueta),
        datasets: [
          {
            label: 'Comentarios',
            data: filas.map((f) => f.cantidad),
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: this.opcionesBase(false),
    };
    this.graficoLineas = new Chart(canvas, config);
  }

  private dibujarTorta(filas: FilaEstadistica[]): void {
    const canvas = this.canvasTorta()?.nativeElement;
    if (!canvas) return;
    this.graficoTorta?.destroy();
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: filas.map((f) => f.etiqueta),
        datasets: [
          {
            label: 'Comentarios',
            data: filas.map((f) => f.cantidad),
            backgroundColor: filas.map((_, i) => this.PALETA[i % this.PALETA.length]),
            borderColor: '#16161f',
            borderWidth: 2,
          },
        ],
      },
      options: this.opcionesBase(true),
    };
    this.graficoTorta = new Chart(canvas, config);
  }

  /** Opciones comunes. esTorta=true muestra leyenda y oculta los ejes. */
  private opcionesBase(esTorta: boolean): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: esTorta,
          position: 'bottom',
          labels: { color: '#e8e8f0' },
        },
      },
      scales: esTorta
        ? {}
        : {
            x: { ticks: { color: '#9aa0b4' }, grid: { color: '#272733' } },
            y: {
              beginAtZero: true,
              ticks: { color: '#9aa0b4', precision: 0 },
              grid: { color: '#272733' },
            },
          },
    };
  }
}
