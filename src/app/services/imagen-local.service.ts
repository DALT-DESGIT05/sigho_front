import { Injectable } from '@angular/core';
import { IMAGENES } from '../pipes/imagenes.generated';

@Injectable({
  providedIn: 'root'
})
export class ImagenLocalService {
  resolver(nombre: string | null | undefined): string {
    if (!nombre) {
      return '';
    }

    if (Object.hasOwn(IMAGENES, nombre)) {
      return IMAGENES[nombre];
    }

    // Conserva URLs de API, blobs, datos y rutas proporcionadas por consumidores.
    return nombre;
  }
}
