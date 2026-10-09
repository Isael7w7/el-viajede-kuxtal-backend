import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../../../entidades/actividad.entity';
import { Dialogo } from '../../../entidades/dialogo.entity';
import { Nivel } from '../../../entidades/nivel.entity';

const NIVELES_SEED = [
  {
    orden: 1,
    nombre: 'El Valle de la Ansiedad',
    descripcion: 'Aprende a identificar y gestionar la ansiedad.',
  },
  {
    orden: 2,
    nombre: 'El Bosque de la Calma',
    descripcion: 'Practica técnicas de relajación.',
  },
  {
    orden: 3,
    nombre: 'La Cima de la Serenidad',
    descripcion: 'Consolida tus habilidades emocionales.',
  },
];

const ACTIVIDADES_SEED = [
  {
    idActividad: 1,
    idNivel: 1,
    orden: 1,
    situacion:
      'Tienes un examen importante mañana y sientes que no estás preparado. Tu corazón late rápido y no puedes dormir.',
    opciones: [
      {
        texto:
          'Respirar profundamente 10 veces y repasar lo que recuerdas tranquilamente',
        esCorrecta: true,
        esEstrategiaSaludable: true,
        retroalimentacion:
          'Respirar profundamente calma tu sistema nervioso. Es una excelente estrategia.',
      },
      {
        texto: 'Seguir estudiando sin parar hasta el amanecer para cubrir todo',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'El agotamiento empeora la ansiedad. El descanso es parte del aprendizaje.',
      },
      {
        texto: 'Ir a jugar videojuegos para no pensar en el examen',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'Evitar el problema puede darte alivio momentáneo, pero aumenta la ansiedad después.',
      },
    ],
  },
  {
    idActividad: 2,
    idNivel: 1,
    orden: 2,
    situacion:
      'Tu mejor amigo(a) no te habló hoy en la escuela y parece enojado(a). Te sientes preocupado(a) y confundido(a).',
    opciones: [
      {
        texto:
          'En un momento tranquilo, preguntarle con sinceridad si está bien',
        esCorrecta: true,
        esEstrategiaSaludable: true,
        retroalimentacion:
          'La comunicación directa y respetuosa fortalece las relaciones.',
      },
      {
        texto: 'Ignorar la situación y hacer como si nada hubiera pasado',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'Ignorar los problemas no los resuelve y puede generar más malentendidos.',
      },
      {
        texto: 'Enfadarse y dejar de hablarle también',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'Reaccionar con enojo puede dañar la amistad. Hay formas más saludables de manejarlo.',
      },
    ],
  },
  {
    idActividad: 3,
    idNivel: 1,
    orden: 3,
    situacion:
      'Te sientes abrumado por todas las tareas de la escuela. Sientes que no tienes tiempo para nada y el estrés no para.',
    opciones: [
      {
        texto:
          'Hacer una lista de prioridades, respirar y pedir ayuda si es necesario',
        esCorrecta: true,
        esEstrategiaSaludable: true,
        retroalimentacion:
          'Organizarte y pedir ayuda son estrategias muy efectivas contra el estrés.',
      },
      {
        texto: 'No hacer nada porque no sabes por dónde empezar',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'La parálisis por overwhelm es común, pero un pequeño paso es mejor que ninguno.',
      },
      {
        texto: 'Cerrar todo y acostarte a ver el celular todo el día',
        esCorrecta: false,
        esEstrategiaSaludable: false,
        retroalimentacion:
          'Huir del problema no lo resuelve. Pequeños pasos pueden hacer gran diferencia.',
      },
    ],
  },
];

const DIALOGOS_SEED = [
  {
    orden: 1,
    emisor: 'Noh Ek',
    personaje: 'nohEk',
    expresion: 'ansioso',
    texto:
      '¡Ayuda! La neblina en el Valle de la Ansiedad se está haciendo cada vez más densa y los pensamientos no me dejan ver el camino...',
  },
  {
    orden: 2,
    emisor: 'Ixchel',
    personaje: 'ixchel',
    expresion: 'neutral',
    texto:
      'Tranquilo Noh Ek. Recuerda que la ansiedad nos hace creer que las cosas son peores de lo que realmente son.',
  },
  {
    orden: 3,
    emisor: 'Ixchel',
    personaje: 'ixchel',
    expresion: 'explicando',
    texto:
      'Para avanzar, Kuxtal debe aprender a escuchar y regular sus emociones. Te acompañaremos en este viaje.',
  },
  {
    orden: 4,
    emisor: 'Ixchel',
    personaje: 'ixchel',
    expresion: 'sonriendo',
    texto:
      'Si logras tomar decisiones con claridad, restauraremos el Equilibrio Emocional y obtendremos el Cristal de la Serenidad.',
  },
  {
    orden: 5,
    emisor: 'Noh Ek',
    personaje: 'nohEk',
    expresion: 'sereno',
    texto: 'Inhalemos profundo... Estoy listo. ¡Vamos juntos al Valle!',
  },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
    @InjectRepository(Dialogo)
    private readonly dialogoRepository: Repository<Dialogo>,
  ) {}

  async onModuleInit() {
    const nivelesExistentes = await this.nivelRepository.count();
    if (nivelesExistentes > 0) {
      this.logger.log('Contenido ya presente en BD, seed omitido');
      return;
    }

    this.logger.log('Sembrando contenido del juego en la BD...');

    const niveles = await this.nivelRepository.save(
      NIVELES_SEED.map((nivel) => this.nivelRepository.create(nivel)),
    );
    const idNivelPorOrden = new Map(
      niveles.map((nivel) => [nivel.orden, nivel.idNivel]),
    );

    await this.actividadRepository.save(
      ACTIVIDADES_SEED.map((actividad) =>
        this.actividadRepository.create({
          ...actividad,
          idNivel: idNivelPorOrden.get(actividad.idNivel) ?? 1,
        }),
      ),
    );

    await this.dialogoRepository.save(
      DIALOGOS_SEED.map((dialogo) => this.dialogoRepository.create(dialogo)),
    );

    this.logger.log(
      `Seed completado: ${niveles.length} niveles, ${ACTIVIDADES_SEED.length} actividades, ${DIALOGOS_SEED.length} diálogos`,
    );
  }
}
