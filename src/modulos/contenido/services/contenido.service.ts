import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../../../entidades/actividad.entity';
import { Dialogo } from '../../../entidades/dialogo.entity';
import { Nivel } from '../../../entidades/nivel.entity';
import { Jugador } from '../../../entidades/jugador.entity';

@Injectable()
export class ContenidoService {
  constructor(
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Dialogo)
    private readonly dialogoRepository: Repository<Dialogo>,
    @InjectRepository(Jugador)
    private readonly jugadorRepository: Repository<Jugador>,
  ) {}

  async obtenerDialogos() {
    return this.dialogoRepository.find({ order: { orden: 'ASC' } });
  }

  /**
   * Devuelve los niveles con el estado de desbloqueo y progreso del jugador.
   * Regla: el nivel 1 siempre está desbloqueado; los demás requieren que el
   * jugador haya completado el nivel anterior (nivelCompletado del MVP).
   */
  async obtenerNiveles(idJugador?: string) {
    const niveles = await this.nivelRepository.find({
      order: { orden: 'ASC' },
    });

    let jugador: Jugador | null = null;
    if (idJugador) {
      jugador = await this.jugadorRepository.findOne({ where: { idJugador } });
      if (!jugador) {
        throw new NotFoundException(
          `No existe un jugador con idJugador=${idJugador}`,
        );
      }
    }

    const conteos = await this.actividadRepository
      .createQueryBuilder('actividad')
      .select('actividad.id_nivel', 'idNivel')
      .addSelect('COUNT(*)', 'total')
      .groupBy('actividad.id_nivel')
      .getRawMany<{ idNivel: number; total: string }>();

    const totalPorNivel = new Map(
      conteos.map((fila) => [Number(fila.idNivel), Number(fila.total)]),
    );

    return niveles.map((nivel) => {
      const esNivelInicial = nivel.orden === 1;
      const desbloqueado = esNivelInicial || Boolean(jugador?.nivelCompletado);
      return {
        idNivel: nivel.idNivel,
        orden: nivel.orden,
        nombre: nivel.nombre,
        descripcion: nivel.descripcion,
        totalActividades: totalPorNivel.get(nivel.idNivel) ?? 0,
        desbloqueado,
        completado: esNivelInicial && Boolean(jugador?.nivelCompletado),
      };
    });
  }

  async obtenerActividadesPorNivel(idNivel: number) {
    const nivel = await this.nivelRepository.findOne({ where: { idNivel } });
    if (!nivel) {
      throw new NotFoundException(`No existe un nivel con idNivel=${idNivel}`);
    }

    return this.actividadRepository.find({
      where: { idNivel },
      order: { orden: 'ASC' },
    });
  }
}
