import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProgresoNivel } from './progreso-nivel.entity';
import { RespuestaJugador } from './respuesta-jugador.entity';

@Entity('jugador')
export class Jugador {
  @PrimaryGeneratedColumn('uuid')
  idJugador: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombreUsuario: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ type: 'int', default: 0 })
  puntajeTotal: number;

  @Column({ type: 'boolean', default: false })
  nivelCompletado: boolean;

  @Column({ type: 'int', default: 0 })
  tiempoTotalSegundos: number;

  @OneToMany(
    () => RespuestaJugador,
    (respuestaJugador) => respuestaJugador.jugador,
  )
  respuestas: RespuestaJugador[];

  @OneToOne(() => ProgresoNivel, (progresoNivel) => progresoNivel.jugador)
  progreso: ProgresoNivel;
}
