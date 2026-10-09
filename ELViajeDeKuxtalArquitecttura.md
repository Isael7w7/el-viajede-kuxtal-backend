# CONTEXT.md — Backend de **El Viaje de Kuxtal**

Documentación técnica, lógica y estructural del servidor del videojuego educativo **"El Viaje de Kuxtal"** (MVP: **El Valle de la Ansiedad**).

---

## 1. Introducción y Arquitectura General

### 1.1 Resumen del proyecto

- **Videojuego:** El Viaje de Kuxtal — videojuego educativo responsivo e interactivo orientado a la **alfabetización emocional**, la **regulación de la ansiedad** y la **toma de decisiones** mediante estrategias cognitivo-conductuales (TCC).
- **Personaje guía:** Noh Ek, un alebrije sabio que acompaña al jugador y representa el equilibrio emocional.
- **Alcance del MVP:** Nivel 1 — **El Valle de la Ansiedad** (5 actividades, IDs `1` a `5`). Al completarlo, el jugador obtiene el **Cristal de la Serenidad**.
- **Rol del backend:** API REST que gestiona el registro de jugadores, el registro de decisiones por actividad, el cálculo de métricas de progreso pedagógico y el resumen analítico para la pantalla de resultados del frontend.

### 1.2 Stack técnico

| Componente | Tecnología |
|---|---|
| Framework | NestJS v10+ (TypeScript) |
| Base de datos | MySQL 8.0 (Docker) / MariaDB / PostgreSQL (agnóstico) |
| ORM | TypeORM (`@nestjs/typeorm`) |
| Validación / Mapeo | `class-validator` + `class-transformer` (ValidationPipe global) |
| Configuración | `@nestjs/config` (`.env`) |
| Contenedorización | Docker Compose |
| Gestor de paquetes | `pnpm` |

### 1.3 Convenciones de nombres

- **Variables, atributos y propiedades:** `camelCase` (en español), p. ej. `idJugador`, `equilibrioEmocional`.
- **Tablas de base de datos:** `snake_case` singular, mapeadas en TypeORM: `jugador`, `respuesta_jugador`, `progreso_nivel`.
- **Archivos y carpetas:** `kebab-case`, p. ej. `jugador.entity.ts`, `crear-jugador.dto.ts`, `respuestas-jugador.module.ts`.

### 1.4 Arquitectura general

Arquitectura modular NestJS por dominio de negocio, con separación estricta de responsabilidades:

```
HTTP ─► Controller (valida DTO) ─► Service (lógica de negocio) ─► Repository (TypeORM) ─► MySQL
```

- **Módulo `Jugadores`** → alta de jugadores + inicialización transaccional de `ProgresoNivel`.
- **Módulo `RespuestasJugador`** → registro de decisiones por actividad y actualización de métricas (transacción con fila de progreso bloqueada).
- **Módulo `Juego`** → finalización del Nivel 1, guardado de tiempo y otorgamiento del Cristal de la Serenidad.
- **Módulo `Métricas`** → resumen analítico unificado para la pantalla de resultados.

Reglas transversales:

- `ValidationPipe` **global** con `whitelist: true` (descarta propiedades sobrantes), `forbidNonWhitelisted: true` (rechaza propiedades no declaradas con error 400) y `transform: true` (instancia DTOs reales).
- Prefijo global **`/api`** para todos los endpoints.
- CORS habilitado para el frontend.
- Todas las escrituras que tocan más de una tabla se ejecutan dentro de **transacciones** de TypeORM.

---

## 2. Estructura de Archivos del Proyecto NestJS

```
el-viajede-kuxtal-backend/
├── Dockerfile                  # Build multi-stage NestJS (builder → production)
├── .dockerignore               # Exclusiones del contexto Docker
├── docker-compose.yml          # Orquestación: db (MySQL) + backend (NestJS)
├── CONTEXT.md                  # Este documento
├── .env                        # Variables de entorno (NO se versiona)
├── .env.example                # Plantilla de variables de entorno
├── package.json
├── nest-cli.json
├── tsconfig.json
└── src/
    ├── main.ts                         # Bootstrap: prefijo /api, ValidationPipe global, CORS
    ├── app.module.ts                   # Módulo raíz: ConfigModule + TypeOrmModule + módulos de negocio
    ├── app.controller.ts               # GET / (healthcheck simple)
    ├── app.service.ts
    │
    ├── entidades/                      # Entidades TypeORM (tablas en snake_case)
    │   ├── jugador.entity.ts           # Tabla `jugador`
    │   ├── respuesta-jugador.entity.ts # Tabla `respuesta_jugador`
    │   └── progreso-nivel.entity.ts    # Tabla `progreso_nivel`
    │
    ├── dtos/                           # DTOs con validación class-validator
    │   ├── crear-jugador.dto.ts
    │   ├── registrar-respuesta.dto.ts
    │   └── finalizar-juego.dto.ts
    │
    └── modulos/                        # Módulos de negocio
        ├── jugadores/
        │   ├── jugadores.module.ts
        │   ├── controllers/
        │   │   └── jugador.controller.ts
        │   └── services/
        │       └── jugador.service.ts
        ├── respuestas-jugador/
        │   ├── respuestas-jugador.module.ts
        │   ├── controllers/
        │   │   └── respuestas-jugador.controller.ts
        │   └── services/
        │       ├── respuestas-jugador.processor.ts   # Lógica transaccional de métricas
        │       └── respuestas-jugador.service.ts     # Utilidades de consulta
        ├── juego/
        │   ├── juego.module.ts
        │   ├── controllers/
        │   │   └── juego.controller.ts
        │   └── services/
        │       └── juego.service.ts
        └── metricas/
            ├── metricas.module.ts
            ├── controllers/
            │   └── metricas.controller.ts
            └── services/
                └── metricas.service.ts
```

---

## 3. Definición de Entidades en TypeScript con Decoradores TypeORM

### 3.1 `Jugador` — `src/entidades/jugador.entity.ts` (tabla `jugador`)

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProgresoNivel } from './progreso-nivel.entity';
import { RespuestaJugador } from './respuesta-jugador.entity';

@Entity('jugador')
export class Jugador {
  @PrimaryGeneratedColumn('uuid')
  idJugador: string;                       // PK UUID autogenerado

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombreUsuario: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;                     // Registro automático

  @Column({ type: 'int', default: 0 })
  puntajeTotal: number;

  @Column({ type: 'boolean', default: false })
  nivelCompletado: boolean;                // true al finalizar el Nivel 1

  @Column({ type: 'int', default: 0 })
  tiempoTotalSegundos: number;

  @OneToMany(() => RespuestaJugador, (respuestaJugador) => respuestaJugador.jugador)
  respuestas: RespuestaJugador[];

  @OneToOne(() => ProgresoNivel, (progresoNivel) => progresoNivel.jugador)
  progreso: ProgresoNivel;
}
```

### 3.2 `RespuestaJugador` — `src/entidades/respuesta-jugador.entity.ts` (tabla `respuesta_jugador`)

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity('respuesta_jugador')
@Index('IDX_respuesta_jugador_id_jugador', ['idJugador'])
export class RespuestaJugador {
  @PrimaryGeneratedColumn('uuid')
  idRespuesta: string;

  @Column({ type: 'uuid', name: 'id_jugador', nullable: false })
  idJugador: string;                       // FK hacia jugador

  @Column({ type: 'int', name: 'id_actividad', nullable: false })
  idActividad: number;                     // Actividad 1 a 5 del Nivel 1

  @Column({ type: 'varchar', length: 255, name: 'respuesta_seleccionada' })
  respuestaSeleccionada: string;

  @Column({ type: 'boolean', name: 'es_correcta' })
  esCorrecta: boolean;                     // ¿Identificó/resolvió bien la emoción o situación?

  @Column({ type: 'boolean', name: 'es_estrategia_saludable' })
  esEstrategiaSaludable: boolean;          // ¿Elegió un afrontamiento adaptativo?

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;

  @ManyToOne(() => Jugador, (jugador) => jugador.respuestas, {
    onDelete: 'CASCADE',                   // Eliminación en cascada
    nullable: false,
  })
  @JoinColumn({ name: 'id_jugador' })
  jugador: Jugador;
}
```

### 3.3 `ProgresoNivel` — `src/entidades/progreso-nivel.entity.ts` (tabla `progreso_nivel`)

```ts
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity('progreso_nivel')
export class ProgresoNivel {
  @PrimaryGeneratedColumn('uuid')
  idProgreso: string;

  @Column({ type: 'uuid', name: 'id_jugador', nullable: false })
  idJugador: string;                       // FK hacia jugador (unique por OneToOne)

  @Column({ type: 'int', name: 'equilibrio_emocional', default: 80 })
  equilibrioEmocional: number;             // 0 a 100; arranca en 80

  @Column({ type: 'int', name: 'respuestas_correctas', default: 0 })
  respuestasCorrectas: number;

  @Column({ type: 'int', name: 'elecciones_saludables', default: 0 })
  eleccionesSaludables: number;

  @Column({ type: 'int', name: 'errores_cometidos', default: 0 })
  erroresCometidos: number;

  @Column({ type: 'boolean', name: 'cristal_obtenido', default: false })
  cristalObtenido: boolean;                // Cristal de la Serenidad

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @OneToOne(() => Jugador, (jugador) => jugador.progreso, {
    onDelete: 'CASCADE',                   // Eliminación en cascada
    nullable: false,
  })
  @JoinColumn({ name: 'id_jugador' })
  jugador: Jugador;
}
```

### 3.4 Diagrama relacional

```
┌──────────────────┐ 1        N ┌──────────────────────┐
│     jugador      ├───────────►│  respuesta_jugador   │
│                  │  CASCADE   │  (FK id_jugador)     │
│  idJugador  PK   │            │  idRespuesta    PK   │
│  nombreUsuario   │            │  idActividad (1..5)  │
│  fechaCreacion   │            │  respuestaSelec.     │
│  puntajeTotal    │            │  esCorrecta          │
│  nivelCompletado │            │  esEstrategiaSalud.  │
│  tiempoTotalSeg. │            │  fechaRegistro       │
└───────┬──────────┘            └──────────────────────┘
        │ 1
        │
        │ 1
┌───────▼──────────┐
│  progreso_nivel  │
│  (FK id_jugador) │
│  idProgreso PK   │
│  equilibrioEmo.  │  0..100, inicia en 80
│  respuestasCorr. │
│  eleccionesSalud.│
│  erroresCometidos│
│  cristalObtenido │  Cristal de la Serenidad
│  fechaActualiz.  │
└──────────────────┘
```

Borrado de un `jugador` → elimina en cascada sus `respuesta_jugador` y su fila `progreso_nivel` (`onDelete: 'CASCADE'`).

---

## 4. Definición de DTOs con ValidationPipes

Los DTOs se validan con el `ValidationPipe` global de `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,                  // elimina propiedades no declaradas
    forbidNonWhitelisted: true,       // responde 400 si llegan propiedades extra
    transform: true,                  // el body llega como instancia del DTO
    transformOptions: { enableImplicitConversion: false },
  }),
);
```

### 4.1 `CrearJugadorDto` — `src/dtos/crear-jugador.dto.ts` (`POST /api/jugadores`)

```ts
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CrearJugadorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Length(2, 100, {
    message: 'El nombre de usuario debe tener entre $constraint1 y $constraint2 caracteres',
  })
  nombreUsuario: string;
}
```

### 4.2 `RegistrarRespuestaDto` — `src/dtos/registrar-respuesta.dto.ts` (`POST /api/respuestasJugador`)

```ts
import {
  IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID, Length, Max, Min,
} from 'class-validator';

export class RegistrarRespuestaDto {
  @IsUUID('4', { message: 'idJugador debe ser un UUID v4 válido' })
  idJugador: string;

  @IsInt()
  @Min(1)
  @Max(5)                                  // actividades del Nivel 1
  idActividad: number;

  @IsString()
  @IsNotEmpty({ message: 'respuestaSeleccionada no puede estar vacía' })
  @Length(1, 255)
  respuestaSeleccionada: string;

  @IsBoolean()
  esCorrecta: boolean;

  @IsBoolean()
  esEstrategiaSaludable: boolean;
}
```

### 4.3 `FinalizarJuegoDto` — `src/dtos/finalizar-juego.dto.ts` (`POST /api/juego/finalizar`)

```ts
import { IsInt, IsUUID, Min } from 'class-validator';

export class FinalizarJuegoDto {
  @IsUUID('4', { message: 'idJugador debe ser un UUID v4 válido' })
  idJugador: string;

  @IsInt()
  @Min(0)
  tiempoTotalSegundos: number;
}
```

---

## 5. Especificación de Servicios y Controladores

### 5.1 Endpoints (prefijo global `/api`)

| Método | Ruta | Módulo | Propósito |
|---|---|---|---|
| `POST` | `/api/jugadores` | Jugadores | Registrar jugador + inicializar `ProgresoNivel` |
| `GET` | `/api/jugadores/:idJugador` | Jugadores | Obtener un jugador por id (soporte) |
| `POST` | `/api/respuestasJugador` | RespuestasJugador | Registrar decisión y actualizar métricas |
| `POST` | `/api/juego/finalizar` | Juego | Finalizar Nivel 1, guardar tiempo, dar Cristal |
| `GET` | `/api/metricas/resumen/:idJugador` | Métricas | Resumen analítico para pantalla de resultados |

### 5.2 `POST /api/jugadores`

**Body:** `CrearJugadorDto`. **Código:** `201 Created`.

Lógica (`JugadorService.crear`, transacción):

1. Inserta `Jugador` (UUID, `puntajeTotal=0`, `nivelCompletado=false`, `tiempoTotalSegundos=0`).
2. Inserta `ProgresoNivel` inicial: `equilibrioEmocional=80`, contadores en `0`, `cristalObtenido=false`.

```ts
@Controller('jugadores')
export class JugadorController {
  constructor(private readonly jugadorService: JugadorService) {}

  @Post()
  crear(@Body() crearJugadorDto: CrearJugadorDto): Promise<Jugador> {
    return this.jugadorService.crear(crearJugadorDto);
  }

  @Get(':idJugador')
  obtenerPorId(@Param('idJugador', ParseUUIDPipe) idJugador: string): Promise<Jugador> {
    return this.jugadorService.obtenerPorId(idJugador);
  }
}
```

**Respuesta (201):**

```json
{
  "idJugador": "e6a24b3a-0f9e-4a2e-9c1b-8f6d2f5a9c11",
  "nombreUsuario": "Yolotli",
  "fechaCreacion": "2026-09-19T18:20:00.000Z",
  "puntajeTotal": 0,
  "nivelCompletado": false,
  "tiempoTotalSegundos": 0
}
```

**Errores:** `400` validación DTO; `500` error de BD.

### 5.3 `POST /api/respuestasJugador`

**Body:** `RegistrarRespuestaDto`. **Código:** `201 Created`.

**Lógica de negocio** (`RespuestasJugadorProcessor.registrar`, en una única transacción con bloqueo de la fila de progreso):

| Condición | Efecto en `ProgresoNivel` |
|---|---|
| `esCorrecta === true` | `respuestasCorrectas += 1` |
| `esEstrategiaSaludable === true` | `eleccionesSaludables += 1` |
| `esCorrecta || esEstrategiaSaludable` (aciertos) | `equilibrioEmocional = min(100, equilibrioEmocional + 1)` |
| Ni correcta ni saludable (error) | `erroresCometidos += 1`; `equilibrioEmocional = max(0, equilibrioEmocional - 2)` |

Reglas auxiliares:

- Se valida previamente la existencia del `jugador` (404 si no existe).
- `equilibrioEmocional` siempre queda acotado en el rango **0 a 100**.
- La fila de progreso se recarga **dentro de la transacción** para evitar condiciones de carrera si llegan respuestas concurrentes.

```ts
@Controller('respuestasJugador')
export class RespuestasJugadorController {
  constructor(private readonly respuestasJugadorProcessor: RespuestasJugadorProcessor) {}

  @Post()
  registrar(@Body() dto: RegistrarRespuestaDto) {
    return this.respuestasJugadorProcessor.registrar(dto);
  }
}
```

**Respuesta (201):** la `RespuestaJugador` registrada (con `idRespuesta` y `fechaRegistro`).

**Errores:** `400` validación (incluye `idActividad` fuera de 1–5); `404` jugador/progreso inexistente.

### 5.4 `POST /api/juego/finalizar`

**Body:** `FinalizarJuegoDto`. **Código:** `201 Created`.

**Efecto** (`JuegoService.finalizarNivel`):

1. Valida existencia de `Jugador` y `ProgresoNivel` (404 si no existen).
2. `jugador.nivelCompletado = true` y `jugador.tiempoTotalSegundos = <valor recibido>`.
3. `progreso.cristalObtenido = true` → **Cristal de la Serenidad**.

```ts
@Controller('juego')
export class JuegoController {
  constructor(private readonly juegoService: JuegoService) {}

  @Post('finalizar')
  finalizar(@Body() finalizarJuegoDto: FinalizarJuegoDto) {
    return this.juegoService.finalizarNivel(finalizarJuegoDto);
  }
}
```

**Respuesta (201):** `{ "jugador": {...}, "progreso": {...} }` ya actualizados.

**Errores:** `400` validación; `404` jugador o progreso inexistente.

### 5.5 `GET /api/metricas/resumen/:idJugador`

**Código:** `200 OK`. Proporciona el desglose pedagógico para la pantalla de resultados del frontend.

```ts
@Controller('metricas')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  @Get('resumen/:idJugador')
  obtenerResumen(@Param('idJugador', ParseUUIDPipe) idJugador: string) {
    return this.metricasService.obtenerResumen(idJugador);
  }
}
```

**Respuesta (200):** objeto unificado con `Jugador`, `ProgresoNivel` y la lista de `RespuestaJugador` (ordenada por `fechaRegistro` ascendente):

```json
{
  "jugador": {
    "idJugador": "e6a24b3a-0f9e-4a2e-9c1b-8f6d2f5a9c11",
    "nombreUsuario": "Yolotli",
    "fechaCreacion": "2026-09-19T18:20:00.000Z",
    "puntajeTotal": 0,
    "nivelCompletado": true,
    "tiempoTotalSegundos": 615
  },
  "progreso": {
    "idProgreso": "9c41f8d2-7b3a-4d10-b9a5-2e6c1f0a8d43",
    "idJugador": "e6a24b3a-0f9e-4a2e-9c1b-8f6d2f5a9c11",
    "equilibrioEmocional": 84,
    "respuestasCorrectas": 4,
    "eleccionesSaludables": 4,
    "erroresCometidos": 1,
    "cristalObtenido": true,
    "fechaActualizacion": "2026-09-19T18:33:40.000Z"
  },
  "respuestas": [
    {
      "idRespuesta": "1f3c9a4e-...",
      "idJugador": "e6a24b3a-...",
      "idActividad": 1,
      "respuestaSeleccionada": "Hablar con Noh Ek sobre lo que siento",
      "esCorrecta": true,
      "esEstrategiaSaludable": true,
      "fechaRegistro": "2026-09-19T18:24:12.000Z"
    }
  ]
}
```

**Errores:** `400` UUID inválido en la ruta; `404` jugador o progreso inexistente.

---

## 6. Configuración de Variables de Entorno (`.env`) y Conexión MySQL

### 6.1 Variables de entorno

Archivo `.env` en la raíz (plantilla versionada en `.env.example`; el `.env` real **no** se sube al repositorio):

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos MySQL / MariaDB (XAMPP local: root sin contraseña)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=el_viaje_de_kuxtal
```

### 6.2 Conexión TypeORM (`AppModule`)

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'el_viaje_de_kuxtal'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        timezone: 'Z',
      }),
    }),
    JugadoresModule,
    RespuestasJugadorModule,
    JuegoModule,
    MetricasModule,
  ],
  ...
})
export class AppModule {}
```

Notas:

- **`synchronize: true` solo en desarrollo**: crea/actualiza el esquema automáticamente a partir de las entidades. En producción se recomienda usar migraciones (`typeorm migration:generate`) con `synchronize: false`.
- **`timezone: 'Z'`**: guarda y lee fechas en UTC para evitar desfases entre servidor y MySQL.
- `autoLoadEntities: true` registra automáticamente las entidades declaradas en cada `TypeOrmModule.forFeature([...])`.

### 6.3 Base de datos local con XAMPP (encender solo cuando se desarrolla)

El backend está configurado para usar el MySQL/MariaDB de **XAMPP** instalado en la máquina (`C:\xampp`), con el usuario `root` **sin contraseña**. La idea es simple: *MySQL solo se enciende cuando vas a desarrollar*.

**Opción A — XAMPP Control Panel (la más cómoda):**
1. Abre `C:\xampp\xampp-control.exe`.
2. En la fila **MySQL** pulsa **Start**. Cuando el módulo quede en verde, la BD está lista.
3. Al terminar de programar, pulsa **Stop**.

**Opción B — Scripts de consola:**

```bash
# Encender MySQL (se abre una ventana que debe permanecer abierta)
C:/xampp/mysql_start.bat

# Apagar MySQL
C:/xampp/mysql_stop.bat
```

**Opción C — En segundo plano (sin ventanas):**

```powershell
# Encender (PowerShell)
Start-Process -FilePath 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList '--defaults-file=C:\xampp\mysql\bin\my.ini','--standalone' -WindowStyle Hidden

# Apagar
C:/xampp/mysql/bin/mysqladmin.exe -h 127.0.0.1 -u root shutdown
```

**Crear la base de datos (solo la primera vez):**

```bash
C:/xampp/mysql/bin/mysql.exe -h 127.0.0.1 -u root -e "CREATE DATABASE IF NOT EXISTS el_viaje_de_kuxtal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Con `synchronize: true` las tablas `jugador`, `respuesta_jugador` y `progreso_nivel` se generan solas al arrancar el backend. También puedes administrar la BD desde **phpMyAdmin** (`http://localhost/phpmyadmin`, incluido con XAMPP, requiere Apache encendido).

> 💡 **Trabajo en equipo:** para que el resto del equipo pruebe contra tu máquina sin publicar la BD, abre el puerto 3306 en el firewall y usa tu IP local en su `DB_HOST` (misma red). Para una BD 100 % en línea y siempre disponible, existe la alternativa gratuita de **Aiven** (MySQL gestionado, 1 GB, sin tarjeta): crear el servicio en `console.aiven.io` y reemplazar `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` en `.env` (requiere SSL).

### 6.4 Arranque del backend

**Opción A — Con Docker (recomendado):**

```bash
# 1. Levantar MySQL 8.0 en Docker
docker compose up -d

# 2. Arrancar el servidor
cp .env.example .env      # solo la primera vez; ajustar credenciales
pnpm install
pnpm start:dev            # http://localhost:3000/api
```

**Opción B — Con XAMPP (local):**

```bash
# 1. Encender MySQL (XAMPP Control Panel → Start, o C:/xampp/mysql_start.bat)
# 2. Ajustar .env con credenciales de XAMPP (DB_USERNAME=root, DB_PASSWORD=)
# 3. Arrancar el servidor
pnpm install
pnpm start:dev            # http://localhost:3000/api
```

---

## 8. Infraestructura de Base de Datos y Entorno Local

### 8.1 Docker Compose — MySQL 8.0 + Backend NestJS containerizados

El archivo `docker-compose.yml` en la raíz del proyecto define dos servicios:

| Servicio | Imagen | Contenedor | Puerto | Propósito |
|---|---|---|---|---|
| `db` | `mysql:8.0` | `kuxtal_mysql` | `3306:3306` | Base de datos MySQL con healthcheck |
| `backend` | Build local (`Dockerfile`) | `kuxtal_backend` | `3000:3000` | API NestJS (espera a que `db` esté saludable) |

**Comandos de uso:**

```bash
# Levantar todo el sistema (construcción + MySQL + backend)
docker compose up --build -d

# Ver el estado de los contenedores
docker compose ps

# Ver logs del backend
docker compose logs -f backend

# Ver logs de MySQL
docker compose logs -f db

# Detener los contenedores (los datos se mantienen en el volumen)
docker compose down

# Detener y ELIMINAR todos los datos (⚠ destructivo)
docker compose down -v
```

### 8.2 Arquitectura agnóstica con `@nestjs/config`

La conexión a la base de datos está totalmente desacoplada del motor mediante variables de entorno. El archivo `src/app.module.ts` utiliza `TypeOrmModule.forRootAsync` con `ConfigService`, lo que permite cambiar de MySQL a PostgreSQL (u otro motor compatible con TypeORM) **sin modificar código fuente**:

```env
# Para MySQL (default)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306

# Para PostgreSQL (solo cambiar variables)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
```

**Variables de entorno disponibles:**

| Variable | Descripción | Default |
|---|---|---|
| `DB_TYPE` | Motor de BD (`mysql`, `postgres`, `sqlite`, etc.) | `mysql` |
| `DB_HOST` | Host del servidor de BD | `localhost` |
| `DB_PORT` | Puerto del servidor de BD | `3306` |
| `DB_USERNAME` | Usuario de la BD | `kuxtal_user` |
| `DB_PASSWORD` | Contraseña de la BD | `kuxtal_password` |
| `DB_DATABASE` | Nombre de la BD | `kuxtal_db` |
| `DB_SYNCHRONIZE` | Auto-sincronizar esquema (`true` en dev) | `true` |

> ⚠ **Nota:** `DB_SYNCHRONIZE=true` solo debe usarse en desarrollo. En producción, desactívalo y usa migraciones de TypeORM.

### 8.3 Pruebas a distancia / Exposición del puerto del servidor

Para que otros miembros del equipo prueben contra tu instancia de MySQL sin necesidad de una BD externa:

1. **Misma red local:** Usa tu IP local en `DB_HOST` del `.env` del otro desarrollador. Asegúrate de que el puerto 3306 esté abierto en tu firewall.

   ```bash
   # En Windows (PowerShell como Admin):
   netsh advfirewall firewall add rule name="MySQL Docker" dir=in action=allow protocol=TCP localport=3306
   ```

2. **Exponer el puerto del backend (para pruebas del frontend):**

   ```bash
   # Si el frontend necesita acceder al backend desde otro dispositivo:
   # El backend ya escucha en 0.0.0.0:3000 por defecto (CORS habilitado)
   ```

3. **Alternativa cloud (siempre disponible):** Para una BD en línea y siempre activa, se puede usar un servicio gestionado como **Aiven** (MySQL gratuito, 1 GB) y reemplazar las variables `DB_*` en `.env`.

---

## 7. Guía de Pruebas con cURL / Postman / Thunder Client

Base URL local: `http://localhost:3000/api`. En Postman/Thunder Client configurar header `Content-Type: application/json` en los POST.

### 7.1 Registrar jugador

**cURL:**

```bash
curl -X POST http://localhost:3000/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "Yolotli"}'
```

✅ 201 → copiar el `idJugador` de la respuesta para las siguientes pruebas.

**Pruebas de validación:**

```bash
# 400: nombre demasiado corto
curl -X POST http://localhost:3000/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "A"}'

# 400: propiedad no permitida (forbidNonWhitelisted)
curl -X POST http://localhost:3000/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "Yolotli", "hack": true}'
```

### 7.2 Registrar respuestas del Nivel 1

Sustituir `:idJugador` por el UUID obtenido. Probar los tres casos de lógica:

**Acierto (correcta y saludable) — sube equilibrio:**

```bash
curl -X POST http://localhost:3000/api/respuestasJugador \
  -H "Content-Type: application/json" \
  -d '{
    "idJugador": "REEMPLAZAR_UUID",
    "idActividad": 1,
    "respuestaSeleccionada": "Respirar profundo y pedir ayuda a Noh Ek",
    "esCorrecta": true,
    "esEstrategiaSaludable": true
  }'
```

**Error (ni correcta ni saludable) — baja equilibrio:**

```bash
curl -X POST http://localhost:3000/api/respuestasJugador \
  -H "Content-Type: application/json" \
  -d '{
    "idJugador": "REEMPLAZAR_UUID",
    "idActividad": 2,
    "respuestaSeleccionada": "Evitar la situación y quedarse callado",
    "esCorrecta": false,
    "esEstrategiaSaludable": false
  }'
```

**Caso mixto (correcta pero no saludable):**

```bash
curl -X POST http://localhost:3000/api/respuestasJugador \
  -H "Content-Type: application/json" \
  -d '{
    "idJugador": "REEMPLAZAR_UUID",
    "idActividad": 3,
    "respuestaSeleccionada": "Gritar para desahogarse",
    "esCorrecta": true,
    "esEstrategiaSaludable": false
  }'
```

**Pruebas de validación:**

```bash
# 400: idActividad fuera de rango (solo 1 a 5)
curl -X POST http://localhost:3000/api/respuestasJugador \
  -H "Content-Type: application/json" \
  -d '{"idJugador": "REEMPLAZAR_UUID", "idActividad": 7, "respuestaSeleccionada": "X", "esCorrecta": true, "esEstrategiaSaludable": true}'

# 404: jugador inexistente
curl -X POST http://localhost:3000/api/respuestasJugador \
  -H "Content-Type: application/json" \
  -d '{"idJugador": "00000000-0000-4000-8000-000000000000", "idActividad": 1, "respuestaSeleccionada": "X", "esCorrecta": true, "esEstrategiaSaludable": true}'
```

### 7.3 Finalizar el nivel

```bash
curl -X POST http://localhost:3000/api/juego/finalizar \
  -H "Content-Type: application/json" \
  -d '{"idJugador": "REEMPLAZAR_UUID", "tiempoTotalSegundos": 615}'
```

✅ 201 → `jugador.nivelCompletado = true` y `progreso.cristalObtenido = true` (Cristal de la Serenidad).

### 7.4 Consultar el resumen

```bash
curl http://localhost:3000/api/metricas/resumen/REEMPLAZAR_UUID
```

✅ 200 → objeto con `jugador`, `progreso` y `respuestas` para la pantalla de resultados.

### 7.5 Flujo de prueba recomendado (Postman / Thunder Client)

Crear una colección con las 4 peticiones en orden:

1. `POST /api/jugadores` → guardar `idJugador` en una variable de colección (script en *Tests*: `pm.collectionVariables.set("idJugador", pm.response.json().idJugador)`).
2. `POST /api/respuestasJugador` × 5 (una por actividad, mezclando aciertos y errores).
3. `POST /api/juego/finalizar` con el tiempo jugado.
4. `GET /api/metricas/resumen/{{idJugador}}` y verificar:
   - `progreso.cristalObtenido === true`
   - `jugador.nivelCompletado === true`
   - `0 ≤ progreso.equilibrioEmocional ≤ 100`
   - `respuestas.length === 5`

### 7.6 Estado del servidor

```bash
curl http://localhost:3000/          # → "Hello World!" (healthcheck)
```

---

## 9. Guía de Despliegue y Exportación con Docker

### 9.1 Archivos de contenedorización

El proyecto incluye los siguientes archivos para despliegue con Docker:

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Build multi-stage (builder → production) para la API NestJS |
| `.dockerignore` | Excluye `node_modules`, `dist`, `.git`, `.env` y logs del contexto de build |
| `docker-compose.yml` | Orquesta los servicios `db` (MySQL 8.0) y `backend` (NestJS API) |

### 9.2 Iniciar todo el sistema con un solo comando

```bash
docker compose up --build -d
```

Este comando:
1. Construye la imagen Docker del backend usando el `Dockerfile` multi-stage.
2. Descarga la imagen `mysql:8.0` si no existe localmente.
3. Levanta el contenedor `kuxtal_mysql` y espera a que pase el healthcheck (`mysqladmin ping`).
4. Una vez que MySQL está saludable, levanta el contenedor `kuxtal_backend`.

### 9.3 Detener y limpiar servicios

```bash
# Detener servicios (los datos en MySQL se mantienen en el volumen)
docker compose down

# Detener y ELIMINAR todos los datos (destructivo)
docker compose down -v
```

### 9.4 Verificar el estado

```bash
# Ver contenedores activos
docker compose ps

# Ver logs del backend
docker compose logs -f backend

# Ver logs de MySQL
docker compose logs -f db

# Probar la API
curl http://localhost:3000/
curl http://localhost:3000/api/jugadores
```

### 9.5 Compartir con compañeros

Para que cualquier compañero pueda ejecutar el proyecto completo:

1. **Subir al repositorio Git** los archivos: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example` y el código fuente.
2. **NO subir** el archivo `.env` (contiene credenciales privadas). El `.gitignore` ya lo excluye.
3. El compañero solo necesita:
   - Clonar el repositorio.
   - Copiar `.env.example` a `.env` y ajustar las variables si es necesario.
   - Ejecutar: `docker compose up -d`

```bash
# En la máquina del compañero:
git clone <repositorio>
cd el-viajede-kuxtal-backend
cp .env.example .env
docker compose up -d
```

### 9.6 Variables de entorno para Docker

Cuando se ejecuta dentro de Docker, el `DB_HOST` debe ser `db` (el nombre del servicio en `docker-compose.yml`), no `localhost`. El `docker-compose.yml` inyecta automáticamente las variables correctas al contenedor `backend`.

| Contexto | `DB_HOST` |
|---|---|
| Desarrollo local (XAMPP) | `localhost` o `127.0.0.1` |
| Docker Compose | `db` |

### 9.7 Estructura de archivos relevante

```
el-viajede-kuxtal-backend/
├── Dockerfile                  # Build multi-stage NestJS
├── .dockerignore               # Exclusiones del contexto Docker
├── docker-compose.yml          # Orquestación: db + backend
├── .env.example                # Plantilla de variables (versionada)
├── .env                        # Variables reales (NO se versiona)
├── package.json
├── pnpm-lock.yaml
└── src/
    └── ...
```
