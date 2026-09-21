import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity('progreso_nivel')
export class ProgresoNivel {
  @PrimaryGeneratedColumn('uuid')
  idProgreso: string;

  @Column({ type: 'uuid', name: 'id_jugador', nullable: false })
  idJugador: string;

  @Column({ type: 'int', name: 'equilibrio_emocional', default: 80 })
  equilibrioEmocional: number;

  @Column({ type: 'int', name: 'respuestas_correctas', default: 0 })
  respuestasCorrectas: number;

  @Column({ type: 'int', name: 'elecciones_saludables', default: 0 })
  eleccionesSaludables: number;

  @Column({ type: 'int', name: 'errores_cometidos', default: 0 })
  erroresCometidos: number;

  @Column({ type: 'boolean', name: 'cristal_obtenido', default: false })
  cristalObtenido: boolean;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @OneToOne(() => Jugador, (jugador) => jugador.progreso, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id_jugador' })
  jugador: Jugador;
}
