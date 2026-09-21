import { Body, Controller, Post } from '@nestjs/common';
import { FinalizarJuegoDto } from '../../../dtos/finalizar-juego.dto';
import { JuegoService } from '../services/juego.service';

@Controller('juego')
export class JuegoController {
  constructor(private readonly juegoService: JuegoService) {}

  @Post('finalizar')
  finalizar(@Body() finalizarJuegoDto: FinalizarJuegoDto) {
    return this.juegoService.finalizarNivel(finalizarJuegoDto);
  }
}
