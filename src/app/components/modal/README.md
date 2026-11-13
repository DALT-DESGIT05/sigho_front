# ModalComponent

Selector: `app-modal`. Modal reutilizable basado en `BsModalService` de ngx-bootstrap.
Requiere el proveedor de `BsModalService`, Bootstrap, Font Awesome y la paleta del proyecto.

Inputs: `title`/`titulo`, `icon`, `size`, `centered`, `scrollable`, `keyboard`,
`ignoreBackdropClick`, `showCloseButton`, `showFooter`, `fitContent`,
`separateFromParent`, `headerDestacado` y `footerEstandar`.
Outputs: `opened` y `closed`. No expone models. Métodos principales: `open()` y `close()`.

Proyección: `[modal-header]` para el subtítulo, contenido libre para el cuerpo
y `[modal-footer]` para el pie.

`footerEstandar` vale `false` por defecto. Con `true`, el pie ocupa todo el ancho:
el elemento directo marcado `modal-footer-close` queda a la izquierda y los demás
elementos a la derecha. Colocar Cerrar/Cancelar primero en el HTML mantiene el orden
de tabulación. Las acciones y sus eventos siguen siendo responsabilidad del consumidor.
En pantallas pequeñas el contenido puede pasar a otra línea sin cambiar ese orden.

```html
<app-modal #modal titulo="Ejemplo" [showFooter]="true" [footerEstandar]="true">
  <p>Contenido del modal.</p>
  <div modal-footer>
    <app-button modal-footer-close action="close" (clicked)="modal.close()" />
    <span>Información adicional</span>
    <app-button action="save" (clicked)="guardar()" />
  </div>
</app-modal>
```
