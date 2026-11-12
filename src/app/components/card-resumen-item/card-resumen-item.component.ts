import { ChangeDetectionStrategy,Component,input} from '@angular/core';
import { ImageLazyComponent, TipoImagenLazy } from '../image-lazy/image-lazy.component';

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
  readonly compacto_en_movil = input(false, { alias: 'compactoEnMovil' });
  readonly tipo_imagen = input<TipoImagenLazy | null>(null, { alias: 'tipoImagen' });
  readonly identificador = input('');
  readonly imagen = input('');
  readonly alt = input('');
  readonly variante = input<'default' | 'programacion' | 'programacion-total'>('default');
}
