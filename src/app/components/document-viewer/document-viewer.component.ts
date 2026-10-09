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
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import DOMPurify from 'dompurify';
import * as mammoth from 'mammoth';
import { PPTXViewer } from 'pptx-viewer';
import * as XLSX from 'xlsx';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { ModalSize } from '../../interfaces/util.interface';

export interface DocumentoVisor {
  archivo: Blob;
  nombre_archivo: string;
}

type TipoDocumento = 'pdf' | 'excel' | 'word' | 'powerpoint' | 'imagen' | 'desconocido';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
})
export class DocumentViewerComponent {
  private static readonly MAX_WORD_FILE_SIZE = 15 * 1024 * 1024;
  private static readonly WORD_DOCUMENT_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy_ref = inject(DestroyRef);
  private readonly modal = viewChild.required(ModalComponent);
  private readonly powerpoint_container = viewChild<ElementRef<HTMLDivElement>>('powerpoint_container');

  readonly documento = input<DocumentoVisor | null>(null);
  readonly size = input<ModalSize>('fullscreen');
  readonly permitir_descarga = input(true);
  readonly permitir_impresion = input(true);
  readonly restringir_interaccion = input(false);
  readonly closed = output<void>();

  readonly archivo_actual = signal<DocumentoVisor | null>(null);
  readonly cargando = signal(false);
  readonly mensaje_error = signal('');
  readonly tipo_documento = signal<TipoDocumento>('desconocido');
  readonly url_pdf = signal<SafeResourceUrl | null>(null);
  readonly url_imagen = signal<SafeUrl | null>(null);
  readonly contenido_word = signal('');
  readonly hojas_excel = signal<string[]>([]);
  readonly hoja_excel_activa = signal('');
  readonly filas_excel = signal<string[][]>([]);
  readonly contenido_powerpoint = signal<ArrayBuffer | null>(null);

  readonly archivo_nombre = computed(() => this.archivo_actual()?.nombre_archivo ?? 'Documento');
  readonly tiene_documento = computed(() => this.archivo_actual() !== null);
  readonly es_pdf = computed(() => this.tipo_documento() === 'pdf');
  readonly es_excel = computed(() => this.tipo_documento() === 'excel');
  readonly es_word = computed(() => this.tipo_documento() === 'word');
  readonly es_powerpoint = computed(() => this.tipo_documento() === 'powerpoint');
  readonly es_imagen = computed(() => this.tipo_documento() === 'imagen');
  readonly puede_imprimir = computed(() => (
    this.permitir_impresion() && (this.es_pdf() || this.es_imagen())
  ));

  private url_objeto: string | null = null;
  private libro_excel: XLSX.WorkBook | null = null;
  private powerpoint_viewer: PPTXViewer | null = null;

  constructor() {
    this.destroy_ref.onDestroy(() => this.liberar_recursos());

    effect(() => {
      const documento = this.documento();
      if (documento) {
        void this.mostrar(documento);
      }
    });

    effect(() => {
      const contenido = this.contenido_powerpoint();
      const contenedor = this.powerpoint_container()?.nativeElement;
      if (!contenido || !contenedor) {
        return;
      }

      this.powerpoint_viewer?.destroy();
      this.powerpoint_viewer = new PPTXViewer(contenedor, {
        keyboardNavigation: true,
        showControls: true,
      });
      void this.powerpoint_viewer.load(contenido).catch(() => {
        this.mensaje_error.set('No se pudo mostrar la presentación. Puede descargarla para abrirla localmente.');
      });
    });
  }

  async mostrar(documento: DocumentoVisor): Promise<void> {
    this.liberar_recursos();
    this.archivo_actual.set(documento);
    this.tipo_documento.set(this.obtener_tipo_documento(documento));
    this.cargando.set(true);
    this.mensaje_error.set('');
    this.modal().open();

    try {
      await this.cargar_documento(documento.archivo);
    } catch (error) {
      this.mensaje_error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo mostrar el contenido de este archivo. Puede descargarlo para abrirlo localmente.',
      );
    } finally {
      this.cargando.set(false);
    }
  }

  cerrar(): void {
    this.modal().close();
  }

  al_cerrar_modal(): void {
    this.liberar_recursos();
    this.archivo_actual.set(null);
    this.closed.emit();
  }

  descargar(): void {
    const documento = this.archivo_actual();
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

  imprimir(): void {
    const documento = this.archivo_actual();
    if (!documento || !this.puede_imprimir()) {
      return;
    }

    const url_impresion = URL.createObjectURL(documento.archivo);
    const marco_impresion = document.createElement('iframe');
    let temporizador_limpieza: number | undefined;

    const limpiar_impresion = (): void => {
      if (temporizador_limpieza !== undefined) {
        window.clearTimeout(temporizador_limpieza);
      }

      marco_impresion.remove();
      URL.revokeObjectURL(url_impresion);
    };

    marco_impresion.style.cssText = 'border:0;height:1px;position:fixed;right:0;visibility:hidden;width:1px;';
    marco_impresion.onload = (): void => {
      const ventana_impresion = marco_impresion.contentWindow;
      if (!ventana_impresion) {
        limpiar_impresion();
        return;
      }

      ventana_impresion.addEventListener('afterprint', limpiar_impresion, { once: true });
      ventana_impresion.focus();
      ventana_impresion.print();
    };
    marco_impresion.src = url_impresion;
    document.body.append(marco_impresion);
    temporizador_limpieza = window.setTimeout(limpiar_impresion, 60_000);
  }

  bloquear_menu_contextual(evento: MouseEvent): void {
    if (this.restringir_interaccion()) {
      evento.preventDefault();
    }
  }

  seleccionar_hoja_excel(nombre_hoja: string): void {
    const hoja = this.libro_excel?.Sheets[nombre_hoja];
    if (!hoja) {
      return;
    }

    const filas = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
      header: 1,
      defval: '',
      raw: false,
    });
    const columnas_maximas = filas.reduce((maximo, fila) => Math.max(maximo, fila.length), 0);
    const filas_normalizadas = filas.map((fila) =>
      Array.from(
        { length: columnas_maximas },
        (_, indice) => String(fila[indice] ?? ''),
      ),
    );

    this.hoja_excel_activa.set(nombre_hoja);
    this.filas_excel.set(filas_normalizadas);
  }

  private async cargar_documento(archivo: Blob): Promise<void> {
    const tipo = this.tipo_documento();

    if (tipo === 'pdf') {
      this.cargar_pdf(archivo);
      return;
    }

    if (tipo === 'excel') {
      await this.cargar_excel(archivo);
      return;
    }

    if (tipo === 'word') {
      await this.cargar_word(archivo);
      return;
    }

    if (tipo === 'powerpoint') {
      await this.cargar_powerpoint(archivo);
      return;
    }

    if (tipo === 'imagen') {
      this.cargar_imagen(archivo);
      return;
    }

    this.mensaje_error.set('Este tipo de archivo no tiene vista previa disponible.');
  }

  private cargar_pdf(archivo: Blob): void {
    this.url_objeto = URL.createObjectURL(archivo);
    this.url_pdf.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.url_objeto));
  }

  private async cargar_excel(archivo: Blob): Promise<void> {
    const datos = await archivo.arrayBuffer();
    this.libro_excel = XLSX.read(datos, { type: 'array' });
    const hojas = this.libro_excel.SheetNames;
    this.hojas_excel.set(hojas);

    if (hojas.length > 0) {
      this.seleccionar_hoja_excel(hojas[0]);
    }
  }

  private async cargar_word(archivo: Blob): Promise<void> {
    this.validar_archivo_word(archivo);
    const datos = await archivo.arrayBuffer();
    const resultado = await mammoth.convertToHtml(
      { arrayBuffer: datos },
      { externalFileAccess: false, includeEmbeddedStyleMap: false },
    );
    this.contenido_word.set(DOMPurify.sanitize(resultado.value, {
      USE_PROFILES: { html: true },
      ALLOW_DATA_ATTR: false,
    }));
  }

  private validar_archivo_word(archivo: Blob): void {
    if (!archivo.size) {
      throw new Error('El documento Word est\u00e1 vac\u00edo.');
    }

    if (archivo.size > DocumentViewerComponent.MAX_WORD_FILE_SIZE) {
      throw new Error('El documento Word supera el l\u00edmite de 15 MB para la vista previa.');
    }

    const nombre = this.archivo_nombre().toLowerCase();
    const tipo = archivo.type.toLowerCase();
    const tipoValido = !tipo || tipo === 'application/octet-stream' || tipo === DocumentViewerComponent.WORD_DOCUMENT_MIME;

    if (!nombre.endsWith('.docx') || !tipoValido) {
      throw new Error('Solo se permiten documentos Word con extensi\u00f3n .docx.');
    }
  }

  private async cargar_powerpoint(archivo: Blob): Promise<void> {
    this.contenido_powerpoint.set(await archivo.arrayBuffer());
  }

  private cargar_imagen(archivo: Blob): void {
    this.url_objeto = URL.createObjectURL(archivo);
    this.url_imagen.set(this.sanitizer.bypassSecurityTrustUrl(this.url_objeto));
  }

  private obtener_tipo_documento(documento: DocumentoVisor): TipoDocumento {
    const nombre = documento.nombre_archivo.toLowerCase();
    const mime = documento.archivo.type.toLowerCase();

    if (mime === 'application/pdf' || nombre.endsWith('.pdf')) {
      return 'pdf';
    }

    if (mime.includes('spreadsheet') || nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
      return 'excel';
    }

    if (mime.includes('wordprocessingml') || nombre.endsWith('.docx')) {
      return 'word';
    }

    if (mime.includes('presentationml') || nombre.endsWith('.pptx')) {
      return 'powerpoint';
    }

    if (
      (mime.startsWith('image/') && mime !== 'image/svg+xml') ||
      /\.(avif|bmp|gif|jpe?g|png|webp)$/.test(nombre)
    ) {
      return 'imagen';
    }

    return 'desconocido';
  }

  private liberar_recursos(): void {
    if (this.url_objeto) {
      URL.revokeObjectURL(this.url_objeto);
      this.url_objeto = null;
    }

    this.url_pdf.set(null);
    this.url_imagen.set(null);
    this.contenido_word.set('');
    this.hojas_excel.set([]);
    this.hoja_excel_activa.set('');
    this.filas_excel.set([]);
    this.contenido_powerpoint.set(null);
    this.libro_excel = null;
    this.powerpoint_viewer?.destroy();
    this.powerpoint_viewer = null;
  }
}
