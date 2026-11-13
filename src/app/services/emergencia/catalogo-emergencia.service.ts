import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import {
  CatalogosEmergencia,
  CatalogosSignosVitales,
} from '../../interfaces/emergencia/catalogo-emergencia.interface';
import { ResponseInteface } from '../../interfaces/response.interface';

@Injectable({ providedIn: 'root' })
export class CatalogoEmergenciaService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  private readonly catalogoCache = new Map<string, any[]>();
  private signosVitalesCache: CatalogosSignosVitales | null = null;
  private cargandoSignosVitales$: Observable<ResponseInteface<CatalogosSignosVitales>> | null = null;

  /**
   * Obtiene únicamente los catálogos solicitados. Si ya están en memoria, los devuelve sin HTTP.
   * Si faltan algunos, solicita solo los faltantes vía ?tablas=a,b.
   * Si no se pasan tablas, garantiza la carga de todos (retrocompatibilidad).
   */
  obtenerCatalogos(tablas?: (keyof CatalogosEmergencia)[]): Observable<ResponseInteface<CatalogosEmergencia>> {
    if (!tablas || tablas.length === 0) {
      return this.httpClient.get<ResponseInteface<CatalogosEmergencia>>(`${this.baseUrl}v1/catalogos`).pipe(
        tap(({ data }) => this.almacenarEnCache(data))
      );
    }

    const faltantes = tablas.filter((tabla) => !this.catalogoCache.has(tabla as string));

    if (faltantes.length === 0) {
      return of({
        status: true,
        code: 200,
        errors: [],
        message: 'Catálogos desde caché en memoria',
        data: this.construirDesdeCache(tablas),
        identifier: '',
        last_activity: null,
      });
    }

    const params = new HttpParams().set('tablas', faltantes.join(','));

    return this.httpClient
      .get<ResponseInteface<CatalogosEmergencia>>(`${this.baseUrl}v1/catalogos`, { params })
      .pipe(
        tap(({ data }) => this.almacenarEnCache(data)),
        map((response) => ({
          ...response,
          data: this.construirDesdeCache(tablas),
        }))
      );
  }

  obtenerSignosVitales(): Observable<ResponseInteface<CatalogosSignosVitales>> {
    if (this.signosVitalesCache) {
      return of({
        status: true,
        code: 200,
        errors: [],
        message: 'Signos vitales desde caché en memoria',
        data: this.signosVitalesCache,
        identifier: '',
        last_activity: null,
      });
    }

    if (!this.cargandoSignosVitales$) {
      this.cargandoSignosVitales$ = this.httpClient
        .get<ResponseInteface<CatalogosSignosVitales>>(`${this.baseUrl}v1/catalogos/signos-vitales`)
        .pipe(
          tap(({ data }) => {
            this.signosVitalesCache = data;
          }),
          share()
        );
    }

    return this.cargandoSignosVitales$;
  }

  private almacenarEnCache(data: Partial<CatalogosEmergencia>): void {
    if (!data) return;
    Object.entries(data).forEach(([key, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        this.catalogoCache.set(key, items);
      }
    });
  }

  private construirDesdeCache(tablas: (keyof CatalogosEmergencia)[]): CatalogosEmergencia {
    const resultado: any = {};
    for (const tabla of tablas) {
      resultado[tabla] = this.catalogoCache.get(tabla as string) ?? [];
    }
    return resultado as CatalogosEmergencia;
  }
}
