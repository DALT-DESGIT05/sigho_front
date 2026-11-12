import {
  Pipe,
  PipeTransform,
  inject
} from '@angular/core';
import { ImagenLocalService } from '../services/imagen-local.service';

@Pipe({
  name: 'imagen',
  standalone: true
})
export class ImagenPipe implements PipeTransform {
  private readonly imagen_local_service = inject(ImagenLocalService);

  transform(nombre: string | null | undefined): string {
    return this.imagen_local_service.resolver(nombre);
  }
}
