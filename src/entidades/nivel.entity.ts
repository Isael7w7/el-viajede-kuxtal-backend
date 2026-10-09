import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Actividad } from './actividad.entity';

@Entity('nivel')
export class Nivel {
  @PrimaryGeneratedColumn()
  idNivel: number;

  @Column({ type: 'int', nullable: false })
  orden: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  descripcion: string;

  @OneToMany(() => Actividad, (actividad) => actividad.nivel)
  actividades: Actividad[];
}
