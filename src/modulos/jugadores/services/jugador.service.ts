import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearJugadorDto } from '../../../dtos/crear-jugador.dto';
import { Jugador } from '../../../entidades/jugador.entity';
import { ProgresoNivel } from '../../../entidades/progreso-nivel.entity';

const EQUILIBRIO_INICIAL = 80;

@Injectable()
export class JugadorService {
  constructor(
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
    @InjectRepository(ProgresoNivel)
    private readonly progresoNivelRepository: Repository<ProgresoNivel>,
  ) {}

  /**
   * Registra un jugador nuevo e inicializa su registro de ProgresoNivel
   * (equilibrioEmocional = 80) en una sola transacción.
   */
  async crear(crearJugadorDto: CrearJugadorDto): Promise<Jugador> {
    return this.jugadorRepository.manager.transaction(async (manager) => {
      const jugador = manager.create(Jugador, {
        nombreUsuario: crearJugadorDto.nombreUsuario,
      });
      const jugadorGuardado = await manager.save(jugador);

      const progreso = manager.create(ProgresoNivel, {
        idJugador: jugadorGuardado.idJugador,
        equilibrioEmocional: EQUILIBRIO_INICIAL,
      });
      await manager.save(progreso);

      return jugadorGuardado;
    });
  }

  async obtenerPorId(idJugador: string): Promise<Jugador> {
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
