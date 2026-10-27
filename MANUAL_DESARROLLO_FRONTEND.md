# Manual de desarrollo frontend

Este manual define las convenciones para desarrollar SIGHO Front con Angular 22. Complementa los skills de `.codex/skills`; cuando una regla sea más específica, prevalece la aplicable al cambio.

## Tecnologías y principios

- Angular 22, TypeScript y Angular Signals son la base del frontend.
- Para cada cambio nuevo, usa la API vigente de la versión instalada. No introduzcas APIs deprecadas ni una alternativa anterior si ya existe una opción moderna.
- Métodos, variables, propiedades, parámetros y signals usan `snake_case`.
- Las clases usan PascalCase y derivan del nombre de archivo: `producto.service.ts` declara `ProductoService`.
- Conserva la ortografía de nombres impuestos externamente por Angular, el DOM, APIs o librerías de terceros.
- Escribe flujo de control legible: llaves, una instrucción por línea y retornos tempranos para condiciones de guarda.

```ts
on_click(event: MouseEvent): void {
  if (this.disabled() || this.loading()) {
    return;
  }

  this.clicked.emit(event);
}
```

## Ubicaciones principales

| Tipo | Ubicación |
| --- | --- |
| Componentes generales | `src/app/components/` |
| Layouts y plantillas compartidas | `src/app/layout/` |
| Módulos | `src/app/modules/` |
| Guards | `src/app/guards/` |
| Interceptors HTTP | `src/app/interceptors/` |
| Services | `src/app/services/<nombre_modulo>/` |
| Interfaces de services | `src/app/interfaces/<nombre_modulo>/` |
| Configuración común | `src/app/config/` |
| Environments | `src/environments/` |

No se colocan services ni interfaces de negocio directamente en la raíz de sus carpetas. Para el módulo Cliente:

```text
src/app/services/cliente/cliente.service.ts
src/app/interfaces/cliente/cliente.interface.ts
```

## Módulos, páginas y componentes hijos

Cada página pertenece a un módulo y se organiza así:

```text
src/app/modules/<nombre_modulo>/pages/<nombre_componente_page>/
```

Un componente hijo exclusivo del flujo de negocio de una página se ubica así:

```text
src/app/modules/<nombre_modulo>/components/<nombre_componente_page>/<nombre_componente_hijo>/
```

No lleves un componente exclusivo de un módulo a `src/app/components/`.

## Archivos y clases

Usa kebab-case en el nombre base y el sufijo exacto de cada artefacto.

| Artefacto | Archivo | Clase |
| --- | --- | --- |
| Componente | `detalle-venta.components.ts` | `DetalleVentaComponents` |
| Service | `producto.service.ts` | `ProductoService` |
| Directive | `resaltar.directive.ts` | `ResaltarDirective` |
| Pipe | `fecha-local.pipe.ts` | `FechaLocalPipe` |
| Guard | `autenticacion.guard.ts` | `AutenticacionGuard` |
| Interceptor | `token.interceptor.ts` | `TokenInterceptor` |
| Resolver | `venta.resolver.ts` | `VentaResolver` |
| Interface | `producto.interface.ts` | `ProductoInterface` |
| Model | `producto.model.ts` | `ProductoModel` |
| Enum | `estado-venta.enum.ts` | `EstadoVentaEnum` |

Un componente usa el mismo nombre base en sus archivos auxiliares:

```text
detalle-venta.components.ts
detalle-venta.components.html
detalle-venta.components.scss
detalle-venta.components.spec.ts
```

## Estado reactivo y formularios

Usa Angular Signals en toda funcionalidad nueva o modificada:

- Estado mutable: `signal()`.
- Estado derivado: `computed()`.
- Efectos indispensables: `effect()`; no para valores que puede expresar `computed()`.
- APIs de componentes: `input()`, `model()` y `output()`.
- No uses `Subject` ni `BehaviorSubject` como estado de aplicación o UI. Si una fuente externa entrega un Observable, conviértela mediante la interoperabilidad de Angular y conserva el estado como signal.

Todos los formularios nuevos o migrados usan Signal Forms desde `@angular/forms/signals`:

- Modelo tipado con `signal<T>()`, árbol con `form()` y controles nativos con `[formField]`.
- Validaciones en el esquema de `form()`; los errores, estado dirty y touched se leen desde el árbol.
- No usar `ReactiveFormsModule`, `FormGroup`, `FormControl`, `FormsModule` ni `ngModel` para formularios.
- La validación local y los errores API `422` se muestran debajo del campo o componente al que pertenecen.

## Componentes generales

Los componentes de `src/app/components/` son reutilizables en toda la aplicación. Un componente general que consume internamente una API por medio de un service es un componente general de negocio y permanece en esa carpeta.

Un componente general nuevo debe aportar una capacidad reutilizable nueva. Si necesita una pieza existente, la compone; por ejemplo, usa el componente general de botón en vez de recrear un botón propio.

Cada componente general debe tener un `README.md` actualizado en su carpeta con:

- propósito y selector;
- inputs, outputs y models públicos;
- dependencias o configuración necesaria;
- al menos un ejemplo práctico de uso.

Actualiza ese documento en el mismo cambio si se modifica su API pública o su integración.

## Configuraciones y utilidades compartidas

Antes de crear un componente, reutiliza `src/app/interfaces/util.interface.ts` y `src/app/services/util.service.ts`.

- `PaletteColor`: colores admitidos.
- `ComponentSize`: tamaños de componentes y tipografía.
- `ButtonAction` y tipos asociados: acciones visuales de botones.
- `UtilService`: utilidades comunes ya implementadas.

No redefinas estos conceptos localmente. Si aparece un método reutilizable en todo el proyecto, agrégalo al service compartido adecuado:

| Necesidad | Ubicación |
| --- | --- |
| Utilidad general, por ejemplo formato de texto | `src/app/services/util.service.ts` |
| Lógica de imágenes | `src/app/services/image.service.ts` |
| Lógica de fechas | `src/app/services/date.service.ts` |

## Services e interfaces

Cada service define y utiliza sus propias interfaces de contrato. Aunque los campos coincidan, una interfaz no se reutiliza, extiende, hereda ni sustituye por una interfaz común de otro service.

Las llamadas de API y sus interfaces se mantienen dentro de sus carpetas de módulo correspondientes.

## Estilos y paleta

Solo se usan las variables `--palette-*` declaradas en el bloque `/* Paleta original de los componentes compartidos. */` de `src/styles.scss`.

- No crear, renombrar ni redefinir variables de paleta.
- No usar literales de color ni otra familia de variables de color en estilos de componentes.
- Un diseño particular se implementa en la hoja `.components.scss` de su propio componente.
- Si los estilos o el comportamiento ya exceden la responsabilidad del componente, se debe proponer extraer un componente dedicado en vez de acumular una hoja de estilos grande.

## Confirmaciones y errores

Antes de ejecutar una consulta, inserción, actualización o eliminación desde un botón, solicita confirmación al usuario. Usa siempre `MESSAGE_CONFIRMATION_DEFAULT` de `src/app/config/constants.ts`; no escribas la pregunta directamente en el componente.

| Caso | Presentación |
| --- | --- |
| Error de negocio personalizado HTTP `409` | SweetAlert2, usando el mensaje de la API cuando exista. |
| Error de validación HTTP `422` | Debajo del campo o componente correspondiente. |
| Validación local de formulario | Debajo del campo o componente correspondiente. |

Los errores `422` no se muestran en SweetAlert2.

## Pruebas

Todo componente nuevo incluye su archivo `.components.spec.ts`. Cuando se actualiza un componente, su prueba se actualiza en el mismo cambio y se ejecuta la prueba focalizada que lo cubre.

Para formularios, cubre como mínimo el modelo inicial, validaciones, sincronización campo-modelo y flujos de envío válido e inválido.

## Verificación final

Antes de finalizar un cambio:

1. Revisa que se aplicaron estas ubicaciones, nombres y contratos compartidos.
2. Ejecuta la prueba focalizada del componente o funcionalidad modificada.
3. Comprueba que los estilos usan únicamente la paleta compartida.
4. Si se modificó texto visible, revisa la codificación UTF-8 y corrige cualquier mojibake.
