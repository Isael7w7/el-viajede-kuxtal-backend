import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Nivel } from './nivel.entity';

export interface OpcionActividadData {
  texto: string;
  esCorrecta: boolean;
  esEstrategiaSaludable: boolean;
  retroalimentacion: string;
}

@Entity('actividad')
export class Actividad {
  @PrimaryGeneratedColumn()
  idActividad: number;

  @Column({ type: 'int', name: 'id_nivel', nullable: false })
  idNivel: number;

  @Column({ type: 'int', nullable: false })
  orden: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  situacion: string;

  @Column({ type: 'json', nullable: false })
  opciones: OpcionActividadData[];

  @ManyToOne(() => Nivel, (nivel) => nivel.actividades, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'id_nivel' })
  nivel: Nivel;
}
