# Imágenes locales

Todas las imágenes locales están en `public/images/`, sin subcarpetas.
Importa `ImagenPipe` en los `imports` del componente:

```html
<img [src]="'logo' | imagen" alt="Logo" />
```

Tabla, tarjetas, selectores y alertas también aceptan nombres en sus entradas de imagen; por ejemplo, `image: 'medico'` en una columna de tabla o `imagen: 'icono_de_aceptacion'` en una alerta.

En TypeScript puedes inyectar `ImagenLocalService` y llamar a `resolver('logo')`.
CSS y `index.html` usan directamente rutas a `images/`.
Las URLs externas, de API, `blob:` y `data:` se conservan.

## Agregar imágenes

1. Guarda el archivo en `public/images/`.
2. Ejecuta `npm run imagenes:generar` si el servidor ya está abierto, o reinicia `npm start`.
3. Usa su alias sin extensión con el pipe. Los nombres descriptivos se convierten automáticamente a minúsculas, sin tildes y con guion bajo: `Vocación Servicio.png` se llama `vocacion_servicio`.

## Alias manuales para archivos numéricos

Edita `src/app/pipes/imagenes.aliases.json`, nunca `imagenes.generated.ts`. El alias apunta al nombre exacto del archivo, incluida su extensión:

```json
{
  "cardiologia": "002.png",
  "pediatria": "084.png"
}
```

Agrega el archivo antes de regenerar el catálogo: el generador rechaza alias inválidos y archivos inexistentes.

```typescript
{ codigo: '002', nombre: 'CARDIOLOGÍA', imagen: 'cardiologia' }
```

```html
<img [src]="'cardiologia' | imagen" alt="Cardiología" />
```

Los alias manuales tienen prioridad sobre los automáticos. Por ejemplo, `cardiologia` apunta a `002.png`, aunque exista `cardiologia.svg`; este último sigue disponible con su extensión explícita.
Los archivos numéricos cuyo significado no está identificado tienen alias provisionales como `imagen_1`; puedes reemplazarlos por nombres descriptivos en el JSON. Los ya identificados usan alias como `odontologia` para `007.png` y `ginecologia` para `010.png`.
Los nombres originales y las rutas existentes siguen funcionando. Para nombres automáticos coincidentes se prioriza el nombre que ya está en snake_case y después PNG. Usa un alias manual o el archivo con extensión si necesitas elegir otra variante.

El catálogo se regenera automáticamente antes de `npm start`, `npm run build`, `npm run watch` y `npm test`. Si ejecutas Angular CLI directamente, genera primero el catálogo.

Cuando hay varias extensiones del mismo nombre, PNG tiene prioridad. Puedes seleccionar un archivo explícitamente con `'presencial.svg' | imagen`.
Los duplicados originales se conservaron como `presencial.png` / `svg-presencial.png` y `virtual.png` / `svg-virtual.png`.
Un nombre desconocido se conserva como entrada; no tiene imagen local asociada.
