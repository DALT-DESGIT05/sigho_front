# AlertDialogComponent

Alerta institucional compacta. Selector: `app-alert-dialog`. Standalone, OnPush y Signals.
No depende de ModalComponent ni de SweetAlert2. Requiere un navegador con soporte de
`HTMLDialogElement.showModal()` (la capa superior nativa mantiene el diálogo sobre navbar,
sidebar y overlays CSS, sin competir mediante z-index).

## Integración

Importar `AlertDialogComponent` en los `imports` del componente consumidor y montar una
instancia en su plantilla. No llamar a `open()` antes de que la vista esté disponible.

```html
<app-alert-dialog #alerta />
```

```typescript
import { viewChild } from '@angular/core';
import { AlertDialogComponent } from './ruta/alert-dialog.component';

readonly alerta = viewChild.required<AlertDialogComponent>('alerta');

async mostrar_exito(): Promise<void> {
  await this.alerta().open({
    tipo: 'success',
    titulo: 'Registro exitoso',
    mensaje: 'La programación se guardó correctamente.'
  });
}
```

La misma API se reutiliza desde cualquier consumidor; no se requiere un servicio ni
modificar el layout. Cada consumidor importa y monta el componente donde lo necesita.

## API pública

- Input `defaults`: `Partial<AlertDialogOptions>`, configuración predeterminada por instancia.
- Outputs `opened: void` y `closed: boolean` (true al confirmar, false al cancelar).
- `open(opciones): Promise<boolean>` abre la alerta. Una llamada mientras está abierta
  devuelve la misma promesa y no reemplaza el mensaje actual.
- `confirmar()` cierra con true; `cancelar()` y `close()` cierran con false.
- Destruir el componente resuelve false y limpia foco, temporizadores y bloqueo de scroll;
  no emite `closed` durante la destrucción.

Opciones de `open()` (título y mensaje obligatorios):

| Propiedad | Predeterminado |
| --- | --- |
| `tipo` | `info`; admite success, error, warning, info, confirm |
| `diseno` | `horizontal`; admite horizontal o centrado |
| `encabezado` | Texto SIGHO según tipo; siempre visible |
| `icono` | Clase Font Awesome según tipo |
| `imagen` | Sin imagen; si se proporciona sustituye el icono |
| `texto_confirmar` | Confirmar para confirm, Aceptar para los demás |
| `texto_cancelar` | Cancelar |
| `variante_confirmar` / `variante_cancelar` | solid / outline (`ButtonVariant`) |
| `color_confirmar` | primary: azul institucional FAP (`PaletteColor`) |
| `mostrar_cancelar` | true para confirm; false para los demás |
| `cerrar_fuera` | false |
| `cerrar_escape` | true |
| `ancho` | horizontal: 460px; centrado: 350px. Un valor explícito tiene prioridad. Ambos limitados por el viewport con márgenes laterales de 1rem |

La posición del diálogo es centrada. En el diseño horizontal, el título está centrado dentro de su columna y el icono se
mantiene a su izquierda: 60px en escritorio, 48px en móvil y 40px bajo 360px.
Se reducen fuentes y espaciado en móvil. Las acciones permanecen centradas al envolver.
La utilidad global `no-block` conserva flex en móvil frente al tema heredado.
Los cinco tipos conservan sus iconos y fondos; el botón principal es azul FAP por defecto.
La entrada usa escala con rebote suave (360ms), el icono aparece con un pulso único
y el fondo se desvanece. La salida conserva 140ms para coincidir con el cierre actual.
Todos estos efectos se desactivan con `prefers-reduced-motion: reduce`.
El encabezado usa gris tenue; el mensaje se centra en su columna y el check de éxito
es de contorno. Los botones usan tamaño md y padding horizontal Bootstrap.
El texto se interpola de forma segura, sin HTML. La imagen es
decorativa (alt vacío) porque título y mensaje comunican el significado; si falla se
recupera el icono. Escape, clic externo y cierre programático devuelven false.
El primer cierre gana; los botones se desactivan durante la salida. En confirmaciones
el foco inicial está en Cancelar. El navegador mantiene el foco dentro del diálogo;
al cerrar se restaura el elemento previo si sigue conectado. Se respeta movimiento reducido.

## Ejemplos de los cinco tipos

### Selección del diseño

Omitir `diseno` conserva el modo horizontal anterior, sin cambios en los consumidores.
El diseño centrado tiene un ancho total de 350px (box-sizing border-box), incluyendo
12px de marco gris tenue por lado. No tiene encabezado superior: el texto institucional
se muestra como firma al pie. Icono circular de 80px, tarjeta blanca, botones redondeados
y esquinas exteriores de 32px. Conserva el límite del viewport y el scroll vertical.

```typescript
await this.alerta().open({
  tipo: 'success', diseno: 'horizontal',
  titulo: '¡Registro exitoso!',
  mensaje: 'La programación médica se registró correctamente.'
});
await this.alerta().open({
  tipo: 'success', diseno: 'centrado',
  titulo: '¡Registro exitoso!',
  mensaje: 'La programación médica se registró correctamente.'
});
const confirmado = await this.alerta().open({
  tipo: 'confirm', diseno: 'centrado',
  titulo: '¿Eliminar programación?',
  mensaje: '¿Está seguro de eliminar esta programación médica?',
  icono: 'fa-solid fa-trash-can', texto_confirmar: 'Sí, eliminar',
  texto_cancelar: 'Cancelar', mostrar_cancelar: true, color_confirmar: 'danger'
});
```

Los dos diseños respetan icono, imagen PNG, fallback, variantes de botones,
ancho personalizado, resultado asíncrono, teclado, foco, bloqueo de scroll y animaciones.

```typescript
await this.alerta().open({
  tipo: 'success', titulo: 'Registro exitoso', mensaje: 'La programación se guardó.'
});
await this.alerta().open({
  tipo: 'error', titulo: 'No se pudo guardar', mensaje: 'Intente nuevamente.'
});
await this.alerta().open({
  tipo: 'warning', titulo: 'Revise los cupos', mensaje: 'La programación no tiene cupos disponibles.'
});
await this.alerta().open({
  tipo: 'info', titulo: 'Consulta finalizada', mensaje: 'No se encontraron registros.'
});
const confirmado = await this.alerta().open({
  tipo: 'confirm',
  titulo: 'Eliminar programación',
  mensaje: '¿Está seguro de eliminar esta programación médica?',
  icono: 'fa-solid fa-trash-can',
  texto_confirmar: 'Sí, eliminar',
  texto_cancelar: 'Cancelar',
  color_confirmar: 'danger',
  cerrar_escape: false
});
if (confirmado) {
  // Ejecutar la eliminación desde el consumidor.
}
```

PNG personalizado, sin nuevas imágenes ni dependencias:

```typescript
await this.alerta().open({
  tipo: 'info',
  encabezado: 'SIGHO · INFORMACIÓN',
  titulo: 'Información de la IPRESS',
  mensaje: 'Revise los datos antes de continuar.',
  imagen: 'images/svg-presencial.png'
});
```

## Recursos reutilizados

Se revisaron ButtonComponent, LabelComponent, ImageLazyComponent, AlertComponent,
ModalComponent, UtilService, util.interface.ts, styles.scss, main.css y default.css.
Se usa ButtonComponent para las acciones y los tipos ButtonVariant y PaletteColor.
LabelComponent está orientado a campos de formulario; aquí se usa HTML semántico.
ImageLazyComponent solo obtiene fotografías desde servicios, por eso PNG utiliza img.
Los PNG existentes incluyen `images/svg-presencial.png` y fondos de módulos; no se
encontró un juego específico para los cinco estados, que utilizan Font Awesome instalado.

Bootstrap proporciona flex, alineación, gap, padding, márgenes, tamaños de imagen,
bordes redondeados y pesos tipográficos. La fuente Poppins se hereda globalmente.
SCSS encapsulado, sin cambios globales ni ng-deep.

Tokens usados directamente: `--palette-white`, `--palette-black`, `--palette-gray-100`,
`--palette-gray-200`, `--palette-gray-600`, `--palette-primary-fap`,
`--palette-primary-fap-50`, `--palette-success`, `--palette-success-50`,
`--palette-danger`, `--palette-danger-50`, `--palette-warning-text`,
`--palette-warning-50`. Los botones reutilizan su propia paleta existente.

Las pruebas unitarias verifican resultado asíncrono, cierre duplicado, Escape, fallback
PNG y limpieza. JSDOM simula showModal/close: la capa superior, Tab y el aspecto visual
requieren verificación en navegador real.
# Imágenes locales por nombre

La opción `imagen` también acepta nombres como `'icono_de_aceptacion'`.
Las rutas y URLs existentes siguen siendo válidas. Consulta [el catálogo y el pipe](../../pipes/README.md).
