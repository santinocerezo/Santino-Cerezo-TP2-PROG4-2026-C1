import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getEstado() {
    return {
      ok: true,
      servicio: 'API Red Social - TP2 Programación IV',
      fecha: new Date().toISOString(),
    };
  }
}
