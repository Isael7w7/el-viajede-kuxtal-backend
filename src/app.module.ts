import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JuegoModule } from './modulos/juego/juego.module';
import { JugadoresModule } from './modulos/jugadores/jugadores.module';
import { MetricasModule } from './modulos/metricas/metricas.module';
import { RespuestasJugadorModule } from './modulos/respuestas-jugador/respuestas-jugador.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('DB_TYPE', 'mysql'),
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'kuxtal_user'),
        password: configService.get<string>('DB_PASSWORD', 'kuxtal_password'),
        database: configService.get<string>('DB_DATABASE', 'kuxtal_db'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        timezone: 'Z',
      }),
    }),
    JugadoresModule,
    RespuestasJugadorModule,
    JuegoModule,
    MetricasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
