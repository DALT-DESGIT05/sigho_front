# Flujo de programación de horarios para Emergencia

Este documento divide la implementación del flujo de programación de personal que necesita el proceso de atención y triaje de Emergencia. La programación publicada debe permitir identificar qué personal está disponible y asociar esa programación con la atención del paciente.

## Camino principal

```text
Catálogo de turnos
    -> Programación de personal
    -> Guardar borrador
    -> Validar conflictos
    -> Publicar programación
    -> Consultar programación vigente
    -> Crear atención de Emergencia
    -> Registrar triaje
    -> Seguimiento de la atención
```

## Alcance

### Incluido

- Catálogo de turnos reutilizable.
- Calendario mensual de programación de personal.
- Estados de programación: `BORRADOR`, `PUBLICADO` y `CANCELADO`.
- Consulta de programación vigente por fecha, área, especialidad y personal.
- Asociación de `programacion_personal_id` al crear una atención.
- Registro y seguimiento del triaje.
- Continuación de atenciones con estado `PENDIENTE_TRIAJE`.

### Fuera de alcance

- Migrar `horario-grid` y `horario-button` de citas para usarlos como calendario de turnos.
- Duplicar el modelo de datos existente.
- Implementar la atención médica posterior al triaje.
- Reemplazar el backend sin validar primero sus contratos.

## Estado actual

`sigho_front` ya contiene una primera versión visual y de demostración:

| Parte | Ubicación | Estado |
|---|---|---|
| Modelo de horarios | `src/app/interfaces/personal/horario.interface.ts` | Disponible |
| Catálogo de turnos | `src/app/modules/personal/pages/catalogo-turnos` | Mock |
| Calendario de programación | `src/app/modules/personal/pages/programacion-personal` | Mock |
| Consulta del horario propio | `src/app/modules/personal/pages/mi-horario` | Mock |
| Servicio de datos | `src/app/services/personal/horario-mock.service.ts` | Reemplazar |
| Registro de triaje | `src/app/modules/emergencia/pages/registro-triaje` | Integrado |
| Seguimiento de pacientes | `src/app/modules/emergencia/pages/pacientes-triaje` | Integrado |

El registro de triaje ya envía `programacion_personal_id`, pero actualmente toma la primera programación recibida desde los catálogos. Debe reemplazarse por una programación vigente y seleccionable.

## Avance de implementación

La primera revisión del contrato ya fue realizada:

- `sigho_back/routes/v1/personal.php` todavía no tiene endpoints de mantenimiento de horarios.
- `GET /v1/catalogos` ya devuelve las programaciones del día del usuario autenticado.
- Cada opción contiene `value`, `label` y `especialidad_id`.
- `value` corresponde a `sighoweb.t_horario_prog_per.id_prog_per`; el request de atención lo transporta como `programacion_personal_id`.
- La selección se compone con el `app-select` existente.
- `app-horario-grid` y `app-horario-button` no aplican porque representan slots de citas.

### Mapeo validado

| Capa | Campo | Uso |
|---|---|---|
| Base de datos | `t_horario_prog_per.id_prog_per` | Identificador real de la programación |
| Base de datos | `t_horario_prog_per.id_persona_personal` | Personal responsable |
| Base de datos | `t_horario_prog_per.id_especialidad` | Especialidad de la programación |
| Base de datos | `t_horario_prog_per.hor_fecha` | Fecha de la programación |
| Request de atención | `atencion.programacion_personal_id` | Transporta el valor de `id_prog_per` |
| Tabla de atención | `t_atencion.id_prog_per` | Guarda el identificador de la programación |
| Tabla de triaje | `t_triaje.id_prog_per` | Conserva la programación asociada al triaje |

La consulta actual de catálogo filtra por el personal autenticado, la fecha actual, especialidad activa y área activa asociada. Por eso no representa todavía un calendario administrativo completo.

La implementación backend de horarios y turnos quedó retirada temporalmente. No hay endpoints personales activos para consultar o persistir estas tablas.

La consulta de metadatos confirmó que `T_HORARIO_PROG_PER` contiene:

```text
ID_PROG_PER, ID_PERSONA_PERSONAL, ID_HORARIO, ID_HORARIO_TURNO,
ID_ESPECIALIDAD, HOR_FECHA, HOR_HORA, HOR_OBS, NRO_CONSUL,
CANT_CUPOS, INTERVALOS, CANTI_ADI, FECHREG, FECHACT,
CODUSUREG, CODUSUACT
```

También confirmó estas relaciones:

- `ID_HORARIO` -> `T_HORARIO.ID_HORARIO`.
- `ID_HORARIO_TURNO` -> `T_HORARIO_TURNO.ID_HORARIO_TURNO`.
- `ID_ESPECIALIDAD` -> `M_ESPECIALIDAD.ID_ESPECIALIDAD`.
- `ID_PERSONA_PERSONAL` -> `T_PERSONAL.ID_PERSONA_PERSONAL`.

La persistencia backend de horarios, programaciones y turnos queda fuera de alcance por ahora.

La vista administrativa `/personal/horarios` conserva el mock y no persiste cambios mientras el backend permanezca fuera de alcance.

El formulario de triaje ahora muestra la programación disponible y actualiza la especialidad asociada al cambiar la selección. La creación y publicación de horarios queda pendiente de endpoints backend.

Durante la validación también se corrigió el request de triaje: el backend exige `triaje.destino_area_id` y ahora el frontend lo envía.

## Fases de implementación

### Fase 1: Confirmar el contrato de datos

Antes de cambiar la UI, confirmar con backend:

- Identificador de personal.
- Identificador de turno.
- Área y especialidad.
- Fecha o rango de vigencia.
- Estado de la programación.
- Identificador usado como `programacion_personal_id`.
- Reglas de conflicto entre turnos.
- Regla para determinar la programación disponible para el usuario autenticado.

**Resultado:** contrato de requests y responses documentado, sin depender del mock.

**Resultado actual:** el contrato de consumo para Emergencia está confirmado mediante `/v1/catalogos`. El CRUD de programación todavía no existe en backend.

### Fase 2: Catálogo de turnos

Reemplazar `HorarioMockService.turnos` por un servicio real.

Operaciones necesarias:

- Listar turnos.
- Crear turno.
- Actualizar turno.
- Activar o desactivar turno.

El formulario debe validar:

- Código y nombre obligatorios.
- Hora inicial y final válidas.
- Duración entre 0 y 24 horas.
- Código único.

**Criterio de aceptación:** un turno creado aparece en el catálogo y puede utilizarse en el calendario.

### Fase 3: Componentes reutilizables

Reutilizar primero los componentes existentes:

- `app-select`: selecciona la programación vigente.
- `app-card-general`: agrupa la información de la programación.
- `app-selection-card`: alternativa para una selección visual.
- `app-button`: acciones de guardar, publicar y cancelar.
- `app-input-date` y `app-input-text`: filtros del calendario.

Solo se extraerá un componente nuevo cuando exista un patrón repetido en más de una pantalla. Los componentes visuales no deben conocer `HttpClient` ni construir requests.

**Criterio de aceptación:** las pantallas reutilizan los componentes existentes sin crear wrappers innecesarios.

### Fase 4: Programación de personal

Implementar el flujo de asignación:

1. Seleccionar período.
2. Filtrar por área, tipo de personal y búsqueda.
3. Seleccionar una persona y un día.
4. Asignar un turno.
5. Guardar como borrador.
6. Editar o cancelar la asignación.

Validaciones:

- No permitir turnos superpuestos.
- No permitir asignaciones para personal inactivo.
- No permitir fechas fuera del período.
- Mostrar claramente las celdas sin turno.

**Criterio de aceptación:** una asignación guardada permanece visible después de recargar los datos.

### Fase 5: Publicación

Agregar la operación de publicación por período.

Antes de publicar:

- Validar conflictos.
- Validar que cada asignación tenga turno válido.
- Confirmar que el período sea publicable.
- Mostrar el resultado de la operación.

Después de publicar:

- Las asignaciones pasan a `PUBLICADO`.
- No se editan directamente sin una nueva acción autorizada.
- Quedan disponibles para el proceso de Emergencia.

**Criterio de aceptación:** solo una programación publicada puede utilizarse para crear una atención.

### Fase 6: Programación vigente para Emergencia

Crear un servicio específico para consultar la programación disponible, separado del servicio de mantenimiento de horarios.

La consulta debe considerar, como mínimo:

- Fecha de atención.
- Área de Emergencia.
- Especialidad.
- Usuario o personal autenticado.
- Estado `PUBLICADO`.

La respuesta debe entregar la programación que se enviará como `programacion_personal_id`.

**Criterio de aceptación:** el formulario de triaje no utiliza automáticamente la primera programación disponible.

### Fase 7: Inicio de atención

En `registro-triaje`:

1. Buscar o registrar al paciente NN.
2. Consultar la programación vigente.
3. Seleccionar la programación del personal.
4. Crear la atención con `POST /v1/emergencia/atenciones`.
5. Usar el `atencion_id` devuelto para registrar el triaje.

La request de atención debe conservar:

```ts
{
  paciente_id,
  atencion: {
    tipo_paciente_id,
    especialidad_id,
    procedencia_id,
    programacion_personal_id,
    numero_historia
  }
}
```

**Criterio de aceptación:** la atención queda asociada a una programación publicada y válida para la fecha.

### Fase 8: Registro y continuación del triaje

Completar el registro con:

- Condición de llegada.
- Motivo de ingreso.
- Nivel de triaje.
- Motivo de consulta.
- Signos vitales.
- Observaciones.

Agregar la posibilidad de continuar una atención `PENDIENTE_TRIAJE`:

- Acción en la fila del seguimiento.
- Ruta `registro-triaje/:atencionId`.
- Carga de los datos de la atención.
- No volver a ejecutar `crearAtencion`.
- Registrar únicamente el triaje pendiente.

**Criterio de aceptación:** una atención pendiente puede completarse sin crear un episodio duplicado.

## Servicios sugeridos

Separar responsabilidades en servicios reales:

| Servicio | Responsabilidad |
|---|---|
| `TurnoService` | Mantenimiento del catálogo de turnos |
| `ProgramacionPersonalService` | Crear, editar, cancelar y publicar programaciones |
| `DisponibilidadPersonalService` | Consultar programaciones vigentes |
| `TriajeService` | Crear atención, registrar triaje y consultar seguimiento |

`HorarioMockService` debe eliminarse cuando las pantallas ya consuman los servicios reales.

## Checklist de implementación

### Datos y backend

- [ ] Contratos de turnos confirmados.
- [ ] Contratos de programación confirmados.
- [ ] Endpoint de publicación disponible.
- [ ] Endpoint de programación vigente disponible.
- [ ] Endpoint de detalle de atención pendiente disponible.

### Frontend

- [ ] Catálogo conectado al backend.
- [ ] Calendario conectado al backend.
- [ ] Componentes reutilizables extraídos.
- [ ] Conflictos de horarios validados.
- [ ] Publicación implementada.
- [ ] Selector de programación agregado al triaje.
- [ ] Atención creada con programación válida.
- [ ] Continuación de `PENDIENTE_TRIAJE` implementada.

### Pruebas

- [ ] Crear y editar un turno.
- [ ] Asignar un turno a una persona.
- [ ] Rechazar turnos superpuestos.
- [ ] Publicar una programación.
- [ ] No mostrar programaciones borrador para atención.
- [ ] Crear atención con `programacion_personal_id`.
- [ ] Registrar triaje de una atención nueva.
- [ ] Retomar una atención pendiente sin duplicarla.

## Orden recomendado de trabajo

Implementar en este orden:

1. Contratos backend.
2. Servicios reales de turnos y programación.
3. Catálogo de turnos.
4. Componentes reutilizables.
5. Calendario de programación.
6. Publicación y validación de conflictos.
7. Consulta de programación vigente.
8. Integración con creación de atención.
9. Continuación de triaje pendiente.
10. Pruebas y eliminación del mock.

Cada fase debe cerrar con sus pruebas y criterios de aceptación antes de iniciar la siguiente.
