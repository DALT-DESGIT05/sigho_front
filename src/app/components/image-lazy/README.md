# ImageLazyComponent

`app-image-lazy` carga una foto desde `ImageService` al entrar en pantalla y muestra una imagen de respaldo si falla.

Entradas: `tipo` (obligatoria: `mi-afiliado`, `afiliado`, `medico` o `mi-foto`), `identificador`, `alt`, `fallbackSrc` (alias predeterminado `foto_por_defecto`), `imageClass` y `objectFit` (`contain` o `cover`). Emite `imageError` cuando falla la carga.

Requiere los proveedores de `ImageService` y sus dependencias HTTP. Las imágenes locales se resuelven mediante `ImagenPipe`; `fallbackSrc` acepta alias del catálogo, rutas o URLs.

```html
<app-image-lazy tipo="medico" identificador="123" alt="Foto del médico" fallbackSrc="foto_por_defecto" />
```
