import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from '../../entidades/jugador.entity';
import { ProgresoNivel } from '../../entidades/progreso-nivel.entity';
import { RespuestaJugador } from '../../entidades/respuesta-jugador.entity';
import { RespuestasJugadorController } from './controllers/respuestas-jugador.controller';
import { RespuestasJugadorProcessor } from './services/respuestas-jugador.processor';
import { RespuestasJugadorService } from './services/respuestas-jugador.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jugador, ProgresoNivel, RespuestaJugador]),
  ],
  controllers: [RespuestasJugadorController],
  providers: [RespuestasJugadorProcessor, RespuestasJugadorService],
})
export class RespuestasJugadorModule {}
