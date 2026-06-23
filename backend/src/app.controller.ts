import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Ruta de salud (GET /). Sirve para verificar que el deploy está activo.
  @Get()
  getEstado() {
    return this.appService.getEstado();
  }
}
