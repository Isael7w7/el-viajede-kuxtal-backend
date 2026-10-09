import { Controller, Get, ParseIntPipe, Param, Query } from '@nestjs/common';
import { ContenidoService } from '../services/contenido.service';

@Controller('contenido')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Get('dialogos')
  obtenerDialogos() {
    return this.contenidoService.obtenerDialogos();
  }

  @Get('niveles')
  obtenerNiveles(@Query('idJugador') idJugador?: string) {
    return this.contenidoService.obtenerNiveles(idJugador || undefined);
  }

  @Get('niveles/:idNivel/actividades')
  obtenerActividadesPorNivel(@Param('idNivel', ParseIntPipe) idNivel: number) {
    return this.contenidoService.obtenerActividadesPorNivel(idNivel);
  }
}
