# CardResumenItemComponent

Selector: `app-card-resumen-item`. Muestra un título y un valor con un icono o imagen.

Inputs: `titulo` y `valor` (obligatorios); `icono`, `tipoImagen`, `identificador`,
`imagen`, `alt`; `variante` (`default`, `programacion`, `programacion-total`).
No emite outputs ni expone models.

`compactoEnMovil` es opcional y vale `false` por defecto. Si está activo,
hasta 767.98 px reduce padding, iconos y tipografía, mantiene la disposición
horizontal y muestra el total en una línea. En escritorio conserva el diseño habitual.

```html
<app-card-resumen-item
  titulo="Programaciones"
  valor="2"
  icono="fa-solid fa-users"
  variante="programacion-total"
  [compactoEnMovil]="true" />
```

Depende de Bootstrap, Font Awesome y las variables `--palette-*` del proyecto.
Para imágenes dinámicas utiliza `ImageLazyComponent` y su configuración de `ImageService`.
