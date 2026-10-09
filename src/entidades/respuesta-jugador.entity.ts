import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity('respuesta_jugador')
@Index('IDX_respuesta_jugador_id_jugador', ['idJugador'])
export class RespuestaJugador {
  @PrimaryGeneratedColumn('uuid')
  idRespuesta: string;

  @Column({ type: 'uuid', name: 'id_jugador', nullable: false })
  idJugador: string;

  @Column({ type: 'int', name: 'id_actividad', nullable: false })
  idActividad: number;

  @Column({ type: 'varchar', length: 255, name: 'respuesta_seleccionada' })
  respuestaSeleccionada: string;

  @Column({ type: 'boolean', name: 'es_correcta' })
  esCorrecta: boolean;

  @Column({ type: 'boolean', name: 'es_estrategia_saludable' })
  esEstrategiaSaludable: boolean;

  @Column({ type: 'int', name: 'tiempo_respuesta_segundos', nullable: true })
  tiempoRespuestaSegundos: number | null;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  @ManyToOne(() => Jugador, (jugador) => jugador.respuestas, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id_jugador' })
  jugador: Jugador;
}
