import { ImagenPipe } from '../../pipes/imagen.pipe';
import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ImageLazyComponent, TipoImagenLazy } from '../image-lazy/image-lazy.component';

@Component({
  selector: 'app-card-persona',
  standalone: true,
  imports: [ImagenPipe, ButtonComponent, ImageLazyComponent],
  templateUrl: './card-persona.component.html',
  styleUrl: './card-persona.component.scss',
})
export class CardPersonaComponent {

  readonly imagen = input('');

  readonly tipoImagen = input<TipoImagenLazy | null>(null);
  readonly identificador = input('');
  readonly nombre = input('');
  readonly documento = input('');
  readonly detalle = input('');
  readonly textoBoton = input('Seleccionar');

  readonly seleccionar = output<void>();
  readonly iconoBoton = input('fa-solid fa-check');
  readonly botonAnchoCompleto = input(true);
  readonly variante = input<'afiliado' | 'medico'>('afiliado');

  onSeleccionar(): void {
    this.seleccionar.emit();
  }
}
