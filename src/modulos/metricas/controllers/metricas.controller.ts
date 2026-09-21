import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { MetricasService } from '../services/metricas.service';

@Controller('metricas')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  @Get('resumen/:idJugador')
  obtenerResumen(@Param('idJugador', ParseUUIDPipe) idJugador: string) {
    return this.metricasService.obtenerResumen(idJugador);
  }
}
