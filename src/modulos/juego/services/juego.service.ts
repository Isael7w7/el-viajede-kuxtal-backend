import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalizarJuegoDto } from '../../../dtos/finalizar-juego.dto';
import { Jugador } from '../../../entidades/jugador.entity';
import { ProgresoNivel } from '../../../entidades/progreso-nivel.entity';

@Injectable()
export class JuegoService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    @InjectRepository(ProgresoNivel)
    private readonly progresoNivelRepository: Repository<ProgresoNivel>,
  ) {}

  /**
   * Marca la finalización del Nivel 1 (El Valle de la Ansiedad):
   * guarda el tiempo total, marca nivelCompletado y otorga el Cristal de la Serenidad.
   */
  async finalizarNivel(finalizarJuegoDto: FinalizarJuegoDto) {
    const jugador = await this.jugadorRepository.findOne({
      where: { idJugador: finalizarJuegoDto.idJugador },
    });
    if (!jugador) {
      throw new NotFoundException(
        `No existe un jugador con idJugador=${finalizarJuegoDto.idJugador}`,
      );
    }

    const progreso = await this.progresoNivelRepository.findOne({
      where: { idJugador: finalizarJuegoDto.idJugador },
    });
    if (!progreso) {
      throw new NotFoundException(
        `No existe progreso para el jugador con idJugador=${finalizarJuegoDto.idJugador}`,
      );
    }

    jugador.nivelCompletado = true;
    jugador.tiempoTotalSegundos = finalizarJuegoDto.tiempoTotalSegundos;
    progreso.cristalObtenido = true;

    await this.jugadorRepository.save(jugador);
    await this.progresoNivelRepository.save(progreso);

    return { jugador, progreso };
  }
}
