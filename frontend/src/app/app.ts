import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Modal } from './shared/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
