import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from '../../../entidades/jugador.entity';
import { ProgresoNivel } from '../../../entidades/progreso-nivel.entity';
import { RespuestaJugador } from '../../../entidades/respuesta-jugador.entity';

@Injectable()
export class MetricasService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    @InjectRepository(ProgresoNivel)
    private readonly progresoNivelRepository: Repository<ProgresoNivel>,
    @InjectRepository(RespuestaJugador)
    private readonly respuestaJugadorRepository: Repository<RespuestaJugador>,
  ) {}

  /**
   * Resumen unificado para la pantalla de resultados del frontend:
   * datos del jugador, su progreso y la lista de respuestas registradas.
   */
  async obtenerResumen(idJugador: string) {
    const jugador = await this.jugadorRepository.findOne({
      where: { idJugador },
    });
    if (!jugador) {
      throw new NotFoundException(
        `No existe un jugador con idJugador=${idJugador}`,
      );
    }

    const progreso = await this.progresoNivelRepository.findOne({
      where: { idJugador },
    });
    if (!progreso) {
      throw new NotFoundException(
        `No existe progreso para el jugador con idJugador=${idJugador}`,
      );
    }

    const respuestas = await this.respuestaJugadorRepository.find({
      where: { idJugador },
      order: { fechaRegistro: 'ASC' },
    });

    return {
      jugador,
      progreso,
      respuestas,
    };
  }
}
