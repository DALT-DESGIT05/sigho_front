# Evaluación del flujo de citas: Hospi y SIGHO

Este documento compara el flujo de citas existente en `hospi_back`/`hospi_front` con la base actual de `sigho_back`/`sigho_front` y el modelo `SIGHO_2026_V24_20261023_1456.mwb`. Su objetivo es definir una base técnica para implementar Citas en SIGHO sin copiar contratos legacy sin validarlos.

## Conclusión

`hospi_front` y `hospi_back` ya tienen un módulo completo de citas. `sigho_front` y `sigho_back` todavía no tienen ese módulo: hoy cuentan con Personal y Emergencia, pero no con reserva, anulación ni reprogramación de citas.

El modelo de SIGHO sí contiene piezas para construirlo alrededor de la programación de personal y la atención:

```text
T_HORARIO
    -> T_HORARIO_PROG_PER
        -> T_HORARIO_TURNO
            -> T_ATENCION
                -> T_PACIENTE
```

La dirección recomendada es:

```text
Programación publicada
    -> Disponibilidad y cupos
    -> Selección de paciente y horario
    -> Creación de atención/cita
    -> Consulta y seguimiento
    -> Anulación o reprogramación
```

Esta relación es una propuesta basada en el código y el modelo disponibles. Antes de implementarla se debe confirmar que `T_ATENCION` será la entidad oficial de la cita en SIGHO.

## Flujo existente en Hospi

### Frontend

`hospi_front` tiene el módulo `src/app/modules/citas/` con pantallas para:

- Reserva de citas.
- Consulta de programación médica.
- Consulta de horarios ocupados.
- Anulación de citas.
- Reprogramación.
- Historial de citas.
- Procedimientos e interconsultas.
- Citas adicionales e imágenes.
- Programación de médicos.
- Confirmación y consulta de pacientes citados.
- Documentos y generación de PDF.

Las rutas están definidas en:

```text
hospi_front/src/app/modules/citas/citas.routes.ts
```

Los servicios principales son:

```text
hospi_front/src/app/services/citas/cita.service.ts
hospi_front/src/app/services/siser/citas.service.ts
hospi_front/src/app/services/programacion-dotores.service.ts
```

### Backend

Las rutas están concentradas en:

```text
hospi_back/routes/v1/citas.php
```

El backend expone operaciones para:

| Operación | Ejemplos de endpoints legacy |
|---|---|
| Buscar programación | `programacion_doctores/list_programaciones_disponibles` |
| Horarios ocupados | `cita/list_horarios_by_programacion_ocupados` |
| Registrar cita | `cita/store_cita`, `cita/store_cita_detalle` |
| Anular | `cita/anular_mi_cita` |
| Reprogramar | `cita/reprogramar_cita` |
| Historial | `cita/historial_citas`, `cita/historial_citas_general` |
| Documentos y PDF | rutas bajo `cita/documentos` y `pdf` |

El controlador principal es:

```text
hospi_back/app/Http/Controllers/citas/CitaController.php
```

El modelo principal utilizado por ese flujo es:

```text
sisan.ghtcita
```

En Hospi la reserva recibe principalmente un afiliado, una programación y una hora. El backend valida disponibilidad y persiste la cita en el modelo legacy.

## Estado actual de SIGHO

### Frontend

Actualmente `sigho_front` no tiene un módulo de Citas ni rutas de reserva. Las rutas funcionales actuales se concentran en:

```text
sigho_front/src/app/modules/emergencia/
sigho_front/src/app/modules/personal/
```

Existen referencias antiguas a servicios e interfaces de citas utilizadas por componentes heredados, pero no existe una funcionalidad completa de Citas en el nuevo módulo.

### Backend

El backend nuevo tiene rutas para:

- Emergencia.
- Triaje.
- Pacientes.
- Acompañantes.
- Catálogos.

La ruta de Personal todavía no tiene endpoints:

```text
sigho_back/routes/v1/personal.php
```

El servicio frontend de Personal ya espera endpoints como:

```text
GET  /v1/personal/programaciones
GET  /v1/personal/turnos
POST /v1/personal/turnos
POST /v1/personal/horarios
POST /v1/personal/horarios/{id}/programaciones
PATCH /v1/personal/horarios/{id}/estado
```

Estos contratos todavía no están respaldados por rutas activas en `sigho_back`.

### Atención de Emergencia

SIGHO ya usa `T_ATENCION` para crear la atención de Emergencia. El modelo contiene campos relacionados con cita:

| Campo | Uso observado |
|---|---|
| `id_persona_paciente` | Paciente asociado |
| `id_especialidad` | Especialidad de la atención |
| `id_prog_per` | Programación de personal asociada |
| `fech_cita` | Fecha de cita registrada en la atención |
| `hora_cita` | Hora de cita registrada en la atención |
| `id_estado_sitcita` | Estado de situación de cita |
| `id_estado_modcita` | Estado o modalidad de cita |
| `fecha_hora_ing` | Fecha y hora de ingreso real |

El flujo actual de Emergencia obtiene una programación vigente y la asocia a la atención. Eso no equivale todavía a un sistema completo de reserva ambulatoria.


El archivo `SIGHO_2026_V24_20261023_1456.mwb` contiene, entre otras, estas entidades relevantes:

- `T_HORARIO`: cabecera o contexto de horario.
- `T_HORARIO_PROG_PER`: programación concreta de una persona, fecha y turno.
- `T_HORARIO_TURNO`: catálogo de turnos y duración.
- `T_PERSONAL`: personal programable.
- `T_ATENCION`: atención que puede guardar programación, fecha y hora de cita.
- `T_PACIENTE`: paciente relacionado con la atención.

La tabla `T_HORARIO_PROG_PER` aparece asociada a datos como:

```text
ID_PROG_PER
ID_PERSONA_PERSONAL
ID_HORARIO
ID_HORARIO_TURNO
ID_ESPECIALIDAD
HOR_FECHA
HOR_HORA
HOR_OBS
NRO_CONSUL
CANT_CUPOS
INTERVALOS
CANTI_ADI
```

Estos campos permiten inferir que la disponibilidad de citas podría calcularse a partir de una programación publicada, sus cupos y sus intervalos. La regla exacta para consumir un cupo todavía debe definirse y validarse contra la base real.

## Flujo objetivo propuesto para SIGHO

### Camino principal

```text
1. Crear o importar programación de personal
2. Publicar la programación
3. Consultar programaciones disponibles por fecha, especialidad e IPRESS
4. Calcular horarios y cupos disponibles
5. Seleccionar paciente, programación y hora
6. Crear la cita o atención dentro de una transacción
7. Consultar citas activas e historial
8. Anular o reprogramar respetando estados y concurrencia
9. Iniciar triaje o atención desde la cita
```

### Separación recomendada de responsabilidades

| Responsabilidad | Entidad o módulo propuesto |
|---|---|
| Catálogo de turnos | `T_HORARIO_TURNO` / módulo Personal |
| Programación de personal | `T_HORARIO` y `T_HORARIO_PROG_PER` / módulo Personal |
| Disponibilidad | Consulta derivada de programación, cupos e intervalos |
| Reserva | Servicio transaccional de Citas |
| Registro de paciente | `T_PACIENTE` |
| Atención creada | `T_ATENCION` |
| Triaje posterior | `T_TRIAJE` y `T_CONTROL_VITAL` |
| Historial y seguimiento | Consultas sobre atención, estados y relaciones clínicas |

## Diferencias con Hospi

No se debe trasladar automáticamente `ghtcita` a SIGHO ni copiar todos los endpoints legacy. Las diferencias observadas son:

| Hospi | SIGHO |
|---|---|
| `sisan.ghtcita` como modelo principal | `T_ATENCION` ya contiene datos de cita y atención |
| Programación de doctores separada del flujo | Programación de personal relacionada con atención |
| API extensa y madura de Citas | Rutas de Citas todavía inexistentes |
| Parámetros legacy como `sec_prog`, `cod_afiliado` y `hora_cita` | Identificadores nuevos como `id_prog_per`, `paciente_id` y `id_especialidad` |
| Varias variantes de procedimientos e imágenes | Alcance nuevo todavía no definido |

La migración debe reutilizar reglas funcionales válidas de Hospi, pero con contratos y nombres propios de SIGHO.

## Riesgos y decisiones pendientes

### Motor de base de datos

El archivo `.mwb` declara objetos `db.mysql`, pero el backend utiliza schema `sighoweb` y expresiones propias de Oracle, como `TO_CHAR` y `TRUNC`.

Antes de implementar repositorios de Citas se debe confirmar:

- Motor real de ejecución.
- Schema real.
- Tablas disponibles en el ambiente.
- Diferencias entre el modelo MWB y la base instalada.

### Entidad oficial de la cita

Se debe confirmar si:

- `T_ATENCION` será también la tabla oficial de citas; o
- existirá una tabla específica de reserva que todavía no aparece en el análisis actual.

### Cupos y concurrencia

La reserva debe ejecutarse dentro de una transacción y proteger el cupo para evitar doble reserva cuando dos usuarios seleccionen el mismo horario.

### Estados

Se deben definir formalmente los estados de:

- Programación.
- Cupo.
- Cita.
- Atención.
- Anulación.
- Reprogramación.

### Alcance funcional

Antes de crear las pantallas se debe decidir si la primera versión incluirá solo:

- Reserva ambulatoria básica.
- Consulta de citas.
- Anulación.
- Reprogramación.

O si también incluirá desde el inicio procedimientos, interconsultas, imágenes, documentos, PDF y programación administrativa.

## Próximos pasos

1. Confirmar el motor y la estructura real de la base de datos.
2. Confirmar que `T_ATENCION` es la entidad oficial para citas.
3. Definir estados y reglas de cupos.
4. Implementar primero endpoints de programación y disponibilidad.
5. Implementar reserva transaccional.
6. Crear el módulo Citas en `sigho_front` usando los componentes y la paleta existentes.
7. Agregar anulación, reprogramación e historial después de validar la reserva básica.
8. Mantener procedimientos, interconsultas e imágenes fuera de la primera entrega salvo requerimiento explícito.

## Referencias

- `hospi_back/routes/v1/citas.php`
- `hospi_back/app/Http/Controllers/citas/CitaController.php`
- `hospi_back/app/Models/Ghtcita.php`
- `hospi_front/src/app/services/citas/cita.service.ts`
- `hospi_front/src/app/modules/citas/citas.routes.ts`
- `sigho_back/routes/v1/emergencia.php`
- `sigho_back/routes/v1/personal.php`
- `sigho_back/app/Models/T_atencion.php`
- `sigho_back/app/Services/Emergencia/AtencionService.php`
- `sigho_front/docs/flujo-programacion-horarios-emergencia.md`
- `C:\Users\DALT-007\Downloads\SIGHO_2026_V24_20261023_1456.mwb`
