import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from '../../entidades/actividad.entity';
import { Dialogo } from '../../entidades/dialogo.entity';
import { Jugador } from '../../entidades/jugador.entity';
import { Nivel } from '../../entidades/nivel.entity';
import { ContenidoController } from './controllers/contenido.controller';
import { ContenidoService } from './services/contenido.service';
import { SeedService } from './services/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Nivel, Actividad, Dialogo, Jugador])],
  controllers: [ContenidoController],
  providers: [ContenidoService, SeedService],
})
export class ContenidoModule {}
