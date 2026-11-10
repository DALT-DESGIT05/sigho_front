import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { ButtonVariant, PaletteColor } from '../../interfaces/util.interface';
import { ButtonComponent } from '../button/button.component';

export type AlertDialogTipo = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertDialogOptions {
  tipo?: AlertDialogTipo;
  diseno?: 'horizontal' | 'centrado';
  encabezado?: string;
  titulo: string;
  mensaje: string;
  icono?: string;
  imagen?: string;
  texto_confirmar?: string;
  texto_cancelar?: string;
  variante_confirmar?: ButtonVariant;
  variante_cancelar?: ButtonVariant;
  color_confirmar?: PaletteColor;
  mostrar_cancelar?: boolean;
  cerrar_fuera?: boolean;
  cerrar_escape?: boolean;
  ancho?: string;
}

const PRESENTACION: Record<AlertDialogTipo, { encabezado: string; icono: string; color: PaletteColor }> = {
  success: {
    encabezado: 'SIGHO · OPERACIÓN EXITOSA',
    icono: 'fa-regular fa-circle-check',
    color: 'success'
  },
  error: {
    encabezado: 'SIGHO · ERROR DEL SISTEMA',
    icono: 'fa-solid fa-circle-xmark',
    color: 'danger'
  },
  warning: {
    encabezado: 'SIGHO · ADVERTENCIA DEL SISTEMA',
    icono: 'fa-solid fa-triangle-exclamation',
    color: 'warning'
  },
  info: {
    encabezado: 'SIGHO · MENSAJE DEL SISTEMA',
    icono: 'fa-solid fa-circle-info',
    color: 'primary'
  },
  confirm: {
    encabezado: 'SIGHO · CONFIRMACIÓN DEL SISTEMA',
    icono: 'fa-solid fa-circle-question',
    color: 'primary'
  }
};

// Varias instancias pueden compartir el documento sin desbloquearlo antes de tiempo.
const bloqueos_scroll = new WeakMap<Document, { cantidad: number; overflow: string }>();
let siguiente_id = 0;

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertDialogComponent implements OnDestroy {
  readonly defaults = input<Partial<AlertDialogOptions>>({});
  readonly opened = output<void>();
  readonly closed = output<boolean>();

  private readonly documento = inject(DOCUMENT);
  private readonly detector = inject(ChangeDetectorRef);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  private readonly opciones = signal<AlertDialogOptions>({ titulo: '', mensaje: '' });
  private readonly cerrando = signal(false);
  private readonly fallo_imagen = signal(false);
  private promesa?: Promise<boolean>;
  private resolver?: (resultado: boolean) => void;
  private temporizador?: ReturnType<typeof setTimeout>;
  private foco_anterior?: HTMLElement;
  private destruido = false;

  protected readonly id = `alert-dialog-${++siguiente_id}`;
  protected readonly configuracion = computed(() => {
    const opciones = this.opciones();
    const tipo = opciones.tipo ?? 'info';
    const diseno = opciones.diseno ?? 'horizontal';
    const presentacion = PRESENTACION[tipo];

    return {
      ...opciones,
      tipo,
      diseno,
      encabezado: opciones.encabezado || presentacion.encabezado,
      icono: opciones.icono || presentacion.icono,
      texto_confirmar: opciones.texto_confirmar || (tipo === 'confirm' ? 'Confirmar' : 'Aceptar'),
      texto_cancelar: opciones.texto_cancelar || 'Cancelar',
      variante_confirmar: opciones.variante_confirmar ?? 'solid',
      variante_cancelar: opciones.variante_cancelar ?? 'outline',
      color_confirmar: opciones.color_confirmar ?? 'primary',
      mostrar_cancelar: opciones.mostrar_cancelar ?? tipo === 'confirm',
      cerrar_fuera: opciones.cerrar_fuera ?? false,
      cerrar_escape: opciones.cerrar_escape ?? true,
      ancho: opciones.ancho ?? (diseno === 'centrado' ? '350px' : '460px')
    };
  });
  protected readonly en_salida = this.cerrando.asReadonly();
  protected readonly imagen_fallida = this.fallo_imagen.asReadonly();

  /** Montar el componente en la vista antes de llamar a open(). */
  open(opciones: AlertDialogOptions): Promise<boolean> {
    if (this.destruido) {
      return Promise.resolve(false);
    }
    if (this.promesa) {
      return this.promesa;
    }

    this.opciones.set({ ...this.defaults(), ...opciones });
    this.cerrando.set(false);
    this.fallo_imagen.set(false);
    this.detector.detectChanges();
    const elemento = this.dialogo().nativeElement;
    this.foco_anterior = this.documento.activeElement as HTMLElement | undefined;
    elemento.showModal();
    this.bloquear_scroll();
    this.promesa = new Promise<boolean>((resolver) => {
      this.resolver = resolver;
    });
    // En confirmaciones el foco inicial recae sobre la acción menos destructiva.
    const selector = this.configuracion().mostrar_cancelar ? '[data-cancelar] button' : '[data-confirmar] button';
    elemento.querySelector<HTMLButtonElement>(selector)?.focus();
    this.opened.emit();
    return this.promesa;
  }

  close(): void {
    this.iniciar_cierre(false);
  }

  confirmar(): void {
    this.iniciar_cierre(true);
  }

  cancelar(): void {
    this.close();
  }

  protected on_escape(evento: Event): void {
    evento.preventDefault();
    if (this.configuracion().cerrar_escape) {
      this.close();
    }
  }

  protected on_fondo(evento: MouseEvent): void {
    if (evento.target !== this.dialogo().nativeElement || !this.configuracion().cerrar_fuera) {
      return;
    }
    const limites = this.dialogo().nativeElement.getBoundingClientRect();
    if (evento.clientX < limites.left || evento.clientX > limites.right || evento.clientY < limites.top || evento.clientY > limites.bottom) {
      this.close();
    }
  }

  protected on_error_imagen(): void {
    this.fallo_imagen.set(true);
  }

  protected on_cierre_nativo(): void {
    if (!this.dialogo().nativeElement.open) {
      this.finalizar(false);
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.finalizar(false, false);
  }

  private iniciar_cierre(resultado: boolean): void {
    if (!this.promesa || this.cerrando()) {
      return;
    }
    this.cerrando.set(true);
    const movimiento_reducido = this.documento.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.temporizador = setTimeout(() => this.finalizar(resultado), movimiento_reducido ? 0 : 140);
  }

  private finalizar(resultado: boolean, emitir = true): void {
    if (!this.promesa) {
      return;
    }
    clearTimeout(this.temporizador);
    const resolver = this.resolver;
    this.resolver = undefined;
    this.promesa = undefined;
    this.dialogo().nativeElement.close();
    const bloqueo = bloqueos_scroll.get(this.documento);
    if (bloqueo && --bloqueo.cantidad === 0) {
      this.documento.documentElement.style.overflow = bloqueo.overflow;
      bloqueos_scroll.delete(this.documento);
    }
    if (this.foco_anterior?.isConnected) {
      this.foco_anterior.focus();
    }
    resolver?.(resultado);
    if (emitir) {
      this.closed.emit(resultado);
    }
  }

  private bloquear_scroll(): void {
    const bloqueo = bloqueos_scroll.get(this.documento);
    if (bloqueo) {
      bloqueo.cantidad++;
      return;
    }
    bloqueos_scroll.set(this.documento, {
      cantidad: 1,
      overflow: this.documento.documentElement.style.overflow
    });
    this.documento.documentElement.style.overflow = 'hidden';
  }
}
