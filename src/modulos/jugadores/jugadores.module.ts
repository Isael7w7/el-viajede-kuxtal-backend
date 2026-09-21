import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from '../../entidades/jugador.entity';
import { ProgresoNivel } from '../../entidades/progreso-nivel.entity';
import { RespuestaJugador } from '../../entidades/respuesta-jugador.entity';
import { JugadorController } from './controllers/jugador.controller';
import { JugadorService } from './services/jugador.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jugador, ProgresoNivel, RespuestaJugador]),
  ],
  controllers: [JugadorController],
  providers: [JugadorService],
  exports: [JugadorService],
})
export class JugadoresModule {}
