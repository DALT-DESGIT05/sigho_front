import { ImagenPipe } from '../../pipes/imagen.pipe';
import { Component, inject, input } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-api',
  standalone: true,
  imports: [ImagenPipe],
  templateUrl: './loading-api.component.html',
  styleUrl: './loading-api.component.scss'
})
export class LoadingApiComponent {
  readonly message = input('Procesando...');

  protected readonly loadingService = inject(LoadingService);
}
