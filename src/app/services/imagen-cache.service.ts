import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagenCacheService {
  private readonly cache = new Map<string, string>();

  /** Guarda una imagen y devuelve la URL temporal para usarla en un <img>. */
  guardarImagen(clave: string, imagen: Blob): string {
    this.eliminarImagen(clave);

    const url = URL.createObjectURL(imagen);
    this.cache.set(clave, url);
    return url;
  }

  /** Devuelve la URL en memoria; undefined indica que se debe consultar al API. */
  obtenerImagen(clave: string): string | undefined {
    return this.cache.get(clave);
  }

  /** Reemplaza la imagen existente y libera la URL temporal anterior. */
  actualizarImagen(clave: string, imagen: Blob): string {
    return this.guardarImagen(clave, imagen);
  }

  /** Elimina una imagen específica y libera la memoria de su object URL. */
  eliminarImagen(clave: string): boolean {
    const url = this.cache.get(clave);

    if (!url) {
      return false;
    }

    URL.revokeObjectURL(url);
    return this.cache.delete(clave);
  }

  /** Vacía el caché completo y libera todas las object URLs creadas. */
  limpiarCache(): void {
    for (const url of this.cache.values()) {
      URL.revokeObjectURL(url);
    }

    this.cache.clear();
  }
}
