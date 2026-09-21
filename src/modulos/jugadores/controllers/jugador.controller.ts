import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CrearJugadorDto } from '../../../dtos/crear-jugador.dto';
import { Jugador } from '../../../entidades/jugador.entity';
import { JugadorService } from '../services/jugador.service';

@Controller('jugadores')
export class JugadorController {
  constructor(private readonly jugadorService: JugadorService) {}

  @Post()
  crear(@Body() crearJugadorDto: CrearJugadorDto): Promise<Jugador> {
    return this.jugadorService.crear(crearJugadorDto);
  }

  @Get(':idJugador')
  obtenerPorId(
    @Param('idJugador', ParseUUIDPipe) idJugador: string,
  ): Promise<Jugador> {
    return this.jugadorService.obtenerPorId(idJugador);
  }
}
