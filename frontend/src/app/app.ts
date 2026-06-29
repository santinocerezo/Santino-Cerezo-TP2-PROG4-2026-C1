import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Modal } from './shared/modal/modal';
import { SesionService } from './services/sesion.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Inyectamos el servicio de sesión para que el contador arranque con la app.
  private readonly sesion = inject(SesionService);
}
