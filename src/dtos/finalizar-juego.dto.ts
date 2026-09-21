import { IsInt, IsUUID, Min } from 'class-validator';

export class FinalizarJuegoDto {
  @IsUUID('4', { message: 'idJugador debe ser un UUID v4 válido' })
  idJugador: string;

  @IsInt()
  @Min(0)
  tiempoTotalSegundos: number;
}
