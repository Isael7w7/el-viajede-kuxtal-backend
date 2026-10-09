import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RegistrarRespuestaDto {
  @IsUUID('4', { message: 'idJugador debe ser un UUID v4 válido' })
  idJugador: string;

  @IsInt()
  @Min(1)
  @Max(5)
  idActividad: number;

  @IsString()
  @IsNotEmpty({ message: 'respuestaSeleccionada no puede estar vacía' })
  @Length(1, 255)
  respuestaSeleccionada: string;

  @IsBoolean()
  esCorrecta: boolean;

  @IsBoolean()
  esEstrategiaSaludable: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  tiempoRespuestaSegundos?: number;
}
