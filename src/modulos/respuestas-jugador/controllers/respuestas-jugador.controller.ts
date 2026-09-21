import { Body, Controller, Post } from '@nestjs/common';
import { RegistrarRespuestaDto } from '../../../dtos/registrar-respuesta.dto';
import { RespuestasJugadorProcessor } from '../services/respuestas-jugador.processor';

@Controller('respuestasJugador')
export class RespuestasJugadorController {
  constructor(
    private readonly respuestasJugadorProcessor: RespuestasJugadorProcessor,
  ) {}

  @Post()
  registrar(@Body() dto: RegistrarRespuestaDto) {
    return this.respuestasJugadorProcessor.registrar(dto);
  }
}
