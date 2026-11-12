import { ImagenPipe } from '../../pipes/imagen.pipe';
import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, SimpleChanges, inject, input, output, signal } from '@angular/core';
import { Observable, Subscription, take } from 'rxjs';
import { ImageService } from '../../services/image.service';

export type TipoImagenLazy = 'mi-afiliado' | 'afiliado' | 'medico' | 'mi-foto';

@Component({ selector: 'app-image-lazy', standalone: true, imports: [ImagenPipe, ], templateUrl: './image-lazy.component.html', styleUrl: './image-lazy.component.scss' })
export class ImageLazyComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly tipo = input.required<TipoImagenLazy>();
  readonly identificador = input('');
  readonly alt = input('Imagen');
  readonly fallbackSrc = input('foto_por_defecto');
  readonly imageClass = input('');
  readonly objectFit = input<'contain' | 'cover'>('contain');
  readonly imageError = output<void>();

  private readonly imageService = inject(ImageService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private subscription?: Subscription;
  private inicializado = false;
  private visible = false;

  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly imagenUrl = signal('');

  ngAfterViewInit(): void { this.inicializado = true; this.observarVisibilidad(); }
  ngOnChanges(changes: SimpleChanges): void { if (this.inicializado && (changes['tipo'] || changes['identificador'])) this.reiniciarCarga(); }
  ngOnDestroy(): void { this.observer?.disconnect(); this.subscription?.unsubscribe(); }

  cargarFallback(): void { this.error.set(true); this.cargando.set(false); this.imageError.emit(); }

  private observarVisibilidad(): void {
    if (typeof IntersectionObserver === 'undefined') { this.visible = true; this.cargarImagen(); return; }
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this.visible = true; this.observer?.disconnect(); this.cargarImagen();
    }, { rootMargin: '150px' });
    this.observer.observe(this.host.nativeElement);
  }

  private reiniciarCarga(): void {
    this.subscription?.unsubscribe(); this.imagenUrl.set(''); this.error.set(false); this.cargando.set(true);
    if (this.visible) this.cargarImagen();
  }

  private cargarImagen(): void {
    const tipo = this.tipo();
    if (!tipo || (tipo !== 'mi-foto' && !this.identificador())) { this.cargarFallback(); return; }
    this.subscription?.unsubscribe();
    this.subscription = this.obtenerImagen().pipe(take(1)).subscribe({
      next: (imagenUrl) => { this.imagenUrl.set(imagenUrl); this.cargando.set(false); },
      error: () => this.cargarFallback(),
    });
  }

  private obtenerImagen(): Observable<string> {
    switch (this.tipo()) {
      case 'mi-afiliado': return this.imageService.obtener_foto(this.identificador());
      case 'afiliado': return this.imageService.obtener_foto_afiliado(this.identificador());
      case 'medico': return this.imageService.obtener_foto_medico(this.identificador());
      case 'mi-foto': return this.imageService.obtener_mi_foto();
    }
  }
}
