import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dialogo')
export class Dialogo {
  @PrimaryGeneratedColumn()
  idDialogo: number;

  @Column({ type: 'int', nullable: false })
  orden: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  emisor: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  personaje: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  expresion: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  texto: string;
}
