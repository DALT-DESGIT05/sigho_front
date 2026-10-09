import { Injectable, inject} from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpContext} from '@angular/common/http';
import { finalize, map, Observable, of, shareReplay } from 'rxjs';
import { ImagenCacheService } from './imagen-cache.service';
import { MOSTRAR_LOADING } from '../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private readonly baseUrl:string=environment.baseUrl;
  private httpClient=inject(HttpClient);
  private imagenCache=inject(ImagenCacheService);
  private readonly solicitudesEnCurso = new Map<string, Observable<string>>();

  constructor() {

  }


  obtener_foto(cod_afiliado: string, mostrar_loading = false): Observable<string> {
    const claveCache = `mi_afiliado:${cod_afiliado}`;
    const url=this.baseUrl+`v1/imagen/mi_afiliado/${cod_afiliado}`;
    return this.obtenerImagenCacheada(claveCache, url, mostrar_loading);
  }

  obtener_foto_medico(cod_psaco: string, mostrar_loading = false): Observable<string> {
    const claveCache = `medico:${cod_psaco}`;
    const url=this.baseUrl+`v1/imagen/medico/${cod_psaco}`;
    return this.obtenerImagenCacheada(claveCache, url, mostrar_loading);
  }

  obtener_mi_foto(mostrar_loading = false): Observable<string> {
    const claveCache = 'mi_foto';
    const url=this.baseUrl+`v1/imagen/mi_foto`;
    return this.obtenerImagenCacheada(claveCache, url, mostrar_loading);
  }

  obtener_foto_afiliado(cod_afiliado: string, mostrar_loading = false): Observable<string> {
    const claveCache = `afiliado:${cod_afiliado}`;
    const url=this.baseUrl+`v1/imagen/afiliado/${cod_afiliado}`;
    return this.obtenerImagenCacheada(claveCache, url, mostrar_loading);
  }

  private obtenerImagenCacheada(claveCache: string, url: string, mostrar_loading: boolean): Observable<string> {
    const imagenCacheada = this.imagenCache.obtenerImagen(claveCache);

    if (imagenCacheada) {
      return of(imagenCacheada);
    }

    const solicitudEnCurso = this.solicitudesEnCurso.get(claveCache);

    if (solicitudEnCurso) {
      return solicitudEnCurso;
    }

    const solicitud = this.httpClient.get(url, { responseType: 'blob', context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) }).pipe(
      map((imagen) => this.imagenCache.guardarImagen(claveCache, imagen)),
      finalize(() => this.solicitudesEnCurso.delete(claveCache)),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.solicitudesEnCurso.set(claveCache, solicitud);
    return solicitud;
  }

}
