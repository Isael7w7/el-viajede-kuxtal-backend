import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrarRespuestaDto } from '../../../dtos/registrar-respuesta.dto';
import { ProgresoNivel } from '../../../entidades/progreso-nivel.entity';
import { RespuestaJugador } from '../../../entidades/respuesta-jugador.entity';
import { RespuestasJugadorService } from './respuestas-jugador.service';

@Injectable()
export class RespuestasJugadorProcessor {
  constructor(
    @InjectRepository(RespuestaJugador)
    private readonly respuestaJugadorRepository: Repository<RespuestaJugador>,
    @InjectRepository(ProgresoNivel)
    private readonly progresoNivelRepository: Repository<ProgresoNivel>,
    private readonly respuestasJugadorService: RespuestasJugadorService,
  ) {}

  /**
   * Registra una respuesta y actualiza el progreso en una única transacción.
   */
  async registrar(registrarRespuestaDto: RegistrarRespuestaDto) {
    const jugador = await this.respuestasJugadorService.obtenerJugador(
      registrarRespuestaDto.idJugador,
    );

    return this.respuestaJugadorRepository.manager.transaction(
      async (manager) => {
        const respuesta = manager.create(RespuestaJugador, {
          idJugador: jugador.idJugador,
          idActividad: registrarRespuestaDto.idActividad,
          respuestaSeleccionada: registrarRespuestaDto.respuestaSeleccionada,
          esCorrecta: registrarRespuestaDto.esCorrecta,
          esEstrategiaSaludable: registrarRespuestaDto.esEstrategiaSaludable,
        });
        await manager.save(respuesta);

        const progreso = await this.obtenerProgresoConBloqueo(
          manager,
          jugador.idJugador,
        );
        this.actualizarMetricas(progreso, registrarRespuestaDto);
        await manager.save(ProgresoNivel, progreso);

        return respuesta;
      },
    );
  }

  private async obtenerProgresoConBloqueo(manager, idJugador: string) {
    const progreso = await manager.findOne(ProgresoNivel, {
      where: { idJugador },
    });
    if (!progreso) {
      throw new NotFoundException(
        `No existe progreso para el jugador con idJugador=${idJugador}`,
      );
    }
    return progreso;
  }

  private actualizarMetricas(
    progreso: ProgresoNivel,
    dto: RegistrarRespuestaDto,
  ): void {
    const aciertos = dto.esCorrecta || dto.esEstrategiaSaludable;

    if (aciertos) {
      if (dto.esCorrecta) {
        progreso.respuestasCorrectas += 1;
      }
      if (dto.esEstrategiaSaludable) {
        progreso.eleccionesSaludables += 1;
      }
      progreso.equilibrioEmocional = Math.min(
        100,
        progreso.equilibrioEmocional + 1,
      );
    } else {
      progreso.erroresCometidos += 1;
      progreso.equilibrioEmocional = Math.max(
        0,
        progreso.equilibrioEmocional - 2,
      );
    }
  }
}
