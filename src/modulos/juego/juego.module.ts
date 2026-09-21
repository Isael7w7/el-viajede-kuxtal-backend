import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Jugador } from '../../entidades/jugador.entity';
import { ProgresoNivel } from '../../entidades/progreso-nivel.entity';
import { JuegoController } from './controllers/juego.controller';
import { JuegoService } from './services/juego.service';

@Module({
  imports: [TypeOrmModule.forFeature([Jugador, ProgresoNivel])],
  controllers: [JuegoController],
  providers: [JuegoService],
})
export class JuegoModule {}
