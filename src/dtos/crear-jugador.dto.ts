import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CrearJugadorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Length(2, 100, {
    message:
      'El nombre de usuario debe tener entre $constraint1 y $constraint2 caracteres',
  })
  nombreUsuario: string;
}
