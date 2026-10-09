import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from 'pdfjs-dist';
import { PageFlip } from '@gullabs/flipbook-core';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { ModalSize } from '../../interfaces/util.interface';

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export interface DocumentoVisorLibro {
  archivo: Blob;
  nombre_archivo: string;
}

@Component({
  selector: 'app-document-viewer-book',
  standalone: true,
  imports: [
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './document-viewer-book.component.html',
  styleUrl: './document-viewer-book.component.scss',
})
export class DocumentViewerBookComponent {
  private readonly destroy_ref = inject(DestroyRef);
  private readonly modal = viewChild.required(ModalComponent);
  private readonly book_host = viewChild<ElementRef<HTMLDivElement>>('book_host');

  readonly documento = input<DocumentoVisorLibro | null>(null);
  readonly size = input<ModalSize>('fullscreen');
  readonly permitir_descarga = input(true);
  readonly restringir_interaccion = input(false);
  readonly closed = output<void>();

  readonly cargando = signal(false);
  readonly mensaje_error = signal('');
  readonly nombre_archivo = signal('Documento PDF');
  readonly pagina_actual = signal(1);
  readonly total_paginas = signal(0);
  readonly es_doble_pagina = signal(this.obtener_doble_pagina());

  readonly paginas_visibles = computed(() => this.es_doble_pagina() ? 2 : 1);
  readonly puede_retroceder = computed(() => this.pagina_actual() > 1);
  readonly puede_avanzar = computed(() => (
    this.pagina_actual() + this.paginas_visibles() <= this.total_paginas()
  ));

  private documento_pdf: PDFDocumentProxy | null = null;
  private page_flip: PageFlip | null = null;

  constructor() {
    this.destroy_ref.onDestroy(() => this.liberar_recursos());

    effect(() => {
      const documento = this.documento();
      if (documento) {
        void this.mostrar(documento);
      }
    });
  }

  async mostrar(documento: DocumentoVisorLibro): Promise<void> {
    this.liberar_recursos();
    this.nombre_archivo.set(documento.nombre_archivo);
    this.pagina_actual.set(1);
    this.total_paginas.set(0);
    this.mensaje_error.set('');
    this.cargando.set(true);
    this.modal().open();

    try {
      const datos = new Uint8Array(await documento.archivo.arrayBuffer());
      this.documento_pdf = await getDocument({ data: datos }).promise;
      this.total_paginas.set(this.documento_pdf.numPages);
      await this.esperar_renderizado();
      await this.crear_libro();
    } catch {
      this.mensaje_error.set('No se pudo preparar el PDF como libro. Verifique que el archivo no esté dañado.');
    } finally {
      this.cargando.set(false);
    }
  }

  avanzar(): void {
    this.page_flip?.flipNext('top');
  }

  retroceder(): void {
    this.page_flip?.flipPrev('top');
  }

  cerrar(): void {
    this.modal().close();
  }

  descargar(): void {
    const documento = this.documento();
    if (!documento || !this.permitir_descarga()) {
      return;
    }

    const url_descarga = URL.createObjectURL(documento.archivo);
    const enlace = document.createElement('a');
    enlace.href = url_descarga;
    enlace.download = documento.nombre_archivo;
    enlace.click();
    URL.revokeObjectURL(url_descarga);
  }

  bloquear_menu_contextual(evento: MouseEvent): void {
    if (this.restringir_interaccion()) {
      evento.preventDefault();
    }
  }

  al_cerrar_modal(): void {
    this.liberar_recursos();
    this.closed.emit();
  }

  private async crear_libro(): Promise<void> {
    const contenedor = this.book_host()?.nativeElement;
    if (!contenedor || !this.documento_pdf) {
      return;
    }

    const pagina_referencia = await this.documento_pdf.getPage(1);
    const vista_referencia = pagina_referencia.getViewport({ scale: 1 });
    const ancho_pagina = 560;
    const alto_pagina = Math.round(ancho_pagina * (vista_referencia.height / vista_referencia.width));
    const raiz_libro = document.createElement('div');
    raiz_libro.className = 'document-viewer-book__flip-root';

    for (let numero_pagina = 1; numero_pagina <= this.total_paginas(); numero_pagina += 1) {
      const pagina = document.createElement('article');
      pagina.className = 'document-viewer-book__page';
      pagina.dataset['density'] = 'soft';

      const canvas = document.createElement('canvas');
      const pie_pagina = document.createElement('span');
      pie_pagina.className = 'document-viewer-book__page-number';
      pie_pagina.textContent = `Página ${numero_pagina}`;

      await this.renderizar_pagina(canvas, numero_pagina, ancho_pagina);
      pagina.append(canvas, pie_pagina);
      raiz_libro.append(pagina);
    }

    contenedor.replaceChildren(raiz_libro);
    this.page_flip = new PageFlip(raiz_libro, {
      width: ancho_pagina,
      height: alto_pagina,
      sizing: 'responsive',
      minWidth: 240,
      maxWidth: ancho_pagina,
      minHeight: Math.round(alto_pagina * (240 / ancho_pagina)),
      maxHeight: alto_pagina,
      drawShadow: true,
      maxShadowOpacity: .65,
      flippingTime: 700,
      usePortrait: true,
      hardCovers: false,
      allowTouchScroll: false,
      respectInteractiveContent: true,
      foldCornerOnHover: true,
      flipOnClick: 'anywhere',
      pageBackground: '#ffffff',
    });
    this.page_flip.on('flip', (evento) => {
      this.pagina_actual.set(evento.data.page + 1);
    });
    this.page_flip.on('changeOrientation', (evento) => {
      this.es_doble_pagina.set(evento.data.orientation === 'landscape');
    });
    this.page_flip.loadFromHTML(Array.from(raiz_libro.children) as HTMLElement[]);
  }

  private async renderizar_pagina(
    canvas: HTMLCanvasElement,
    numero_pagina: number,
    ancho_pagina: number,
  ): Promise<void> {
    if (!this.documento_pdf) {
      return;
    }

    const pagina = await this.documento_pdf.getPage(numero_pagina);
    const vista_base = pagina.getViewport({ scale: 1 });
    const densidad = Math.min(window.devicePixelRatio || 1, 2);
    const escala = (ancho_pagina / vista_base.width) * densidad;
    const vista = pagina.getViewport({ scale: escala });

    canvas.width = Math.floor(vista.width);
    canvas.height = Math.floor(vista.height);
    await pagina.render({ canvas, viewport: vista }).promise;
  }

  private obtener_doble_pagina(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  }

  private esperar_renderizado(): Promise<void> {
    return new Promise((resolver) => window.requestAnimationFrame(() => resolver()));
  }

  private liberar_recursos(): void {
    this.page_flip?.destroy();
    this.page_flip = null;
    void this.documento_pdf?.cleanup();
    this.documento_pdf = null;
  }
}
