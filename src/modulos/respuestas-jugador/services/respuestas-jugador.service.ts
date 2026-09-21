import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from '../../../entidades/jugador.entity';

@Injectable()
export class RespuestasJugadorService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
  ) {}

  async obtenerJugador(idJugador: string): Promise<Jugador> {
    const jugador = await this.jugadorRepository.findOne({
      where: { idJugador },
    });
    if (!jugador) {
      throw new NotFoundException(
        `No existe un jugador con idJugador=${idJugador}`,
      );
    }
    return jugador;
  }
}
