import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from '../../entidades/jugador.entity';
import { ProgresoNivel } from '../../entidades/progreso-nivel.entity';
import { RespuestaJugador } from '../../entidades/respuesta-jugador.entity';
import { MetricasController } from './controllers/metricas.controller';
import { MetricasService } from './services/metricas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Jugador, ProgresoNivel, RespuestaJugador]),
  ],
  controllers: [MetricasController],
  providers: [MetricasService],
})
export class MetricasModule {}
