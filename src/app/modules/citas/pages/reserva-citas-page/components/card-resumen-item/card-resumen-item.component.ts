import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';
import {
  ImageLazyComponent,
  TipoImagenLazy
} from '../../../../../../components/image-lazy/image-lazy.component';

@Component({
  selector: 'app-card-resumen-item',
  standalone: true,
  imports: [
    ImageLazyComponent
  ],
  templateUrl: './card-resumen-item.component.html',
  styleUrl: './card-resumen-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardResumenItemComponent {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly icono = input('');
  readonly tipo_imagen = input<TipoImagenLazy | null>(null, { alias: 'tipoImagen' });
  readonly identificador = input('');
  readonly imagen = input('');
  readonly alt = input('');
}
