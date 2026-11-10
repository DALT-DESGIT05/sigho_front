import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Observable, map } from 'rxjs';
import { AutoCompleteComponent } from '../../../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { LabelComponent } from '../../../../../../components/label/label.component';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import {
  CategoriaApoyoImagen,
  Diagnostico,
  OrdenImagen,
  PrioridadOrdenMedica,
  ServicioImagen,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { ImagenService } from '../../../../../../services/emergencia/imagen.service';

export interface GuardarApoyoImagenPayload {
  prioridad_id: number;
  diagnostico_id: number;
  servicio_codigo: string;
  requiere_contraste: boolean;
  datos_clinicos: string;
  observacion: string;
}

@Component({
  selector: 'app-tab-apoyo-imagen',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    LabelComponent,
    AutoCompleteComponent,
  ],
  templateUrl: './tab-apoyo-imagen.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabApoyoImagenComponent {
  private readonly imagenService = inject(ImagenService);

  readonly modal = viewChild<ModalComponent>('modal');
  readonly orden_impresion_apoyo = viewChild<ElementRef<HTMLElement>>('orden_impresion_apoyo');

  // Inputs reactivos
  ordenes_imagen = input<readonly OrdenImagen[]>([]);
  diagnosticos = input<readonly Diagnostico[]>([]);
  prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  habilitado = input<boolean>(false);
  cargando = input<boolean>(false);
  guardando = input<boolean>(false);
  pacienteNombre = input<string>('');
  pacienteHistoria = input<string>('');

  // Outputs
  guardarSolicitud = output<GuardarApoyoImagenPayload>();

  // Estado interno con Signals
  readonly categoria_apoyo_imagen = signal<CategoriaApoyoImagen | null>(null);
  readonly servicio_imagen_seleccionado = signal<ServicioImagen | null>(null);
  readonly prioridad_apoyo_id = signal<number | null>(null);
  readonly diagnostico_apoyo_id = signal<number | null>(null);
  readonly datos_clinicos_apoyo = signal<string>('');
  readonly observacion_apoyo = signal<string>('');
  readonly requiere_contraste = signal<boolean>(false);

  readonly categorias_apoyo_imagen: {
    id: CategoriaApoyoImagen;
    nombre: string;
    icono: string;
    area_codigo: string;
  }[] = [
    { id: 'radiografias', nombre: 'Radiografías', icono: 'fa-solid fa-lungs', area_codigo: '012' },
    { id: 'ecografias', nombre: 'Ecografías', icono: 'fa-solid fa-wave-square', area_codigo: '004' },
    { id: 'tomografias', nombre: 'Tomografías', icono: 'fa-solid fa-brain', area_codigo: '014' },
    { id: 'resonancias', nombre: 'Resonancias', icono: 'fa-solid fa-magnet', area_codigo: '013' },
    { id: 'mamografias', nombre: 'Mamografías', icono: 'fa-solid fa-ribbon', area_codigo: '008' },
  ];

  readonly categoria_apoyo_imagen_actual = computed(
    () =>
      this.categorias_apoyo_imagen.find((item) => item.id === this.categoria_apoyo_imagen()) ??
      null,
  );

  seleccionar_categoria_apoyo_imagen(categoria: CategoriaApoyoImagen): void {
    this.categoria_apoyo_imagen.set(
      this.categoria_apoyo_imagen() === categoria ? null : categoria,
    );
    this.limpiar_formulario();
  }

  readonly buscar_servicio_imagen_datasource = (
    termino: string,
  ): Observable<readonly ServicioImagen[]> => {
    const categoria = this.categoria_apoyo_imagen_actual();

    return this.imagenService.buscar_servicios_imagen(termino).pipe(
      map((res: { data?: ServicioImagen[] }) => {
        const servicios = res.data ?? [];
        return categoria
          ? servicios.filter((servicio: ServicioImagen) => servicio.area_codigo === categoria.area_codigo)
          : servicios;
      }),
    );
  };

  mostrar_servicio_imagen = (servicio: ServicioImagen): string =>
    `${servicio.codigo} - ${servicio.nombre}`;

  seleccionar_servicio_imagen(servicio: ServicioImagen): void {
    this.servicio_imagen_seleccionado.set(servicio);
  }

  actualizar_prioridad(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.prioridad_apoyo_id.set(value ? Number(value) : null);
  }

  actualizar_diagnostico(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.diagnostico_apoyo_id.set(value ? Number(value) : null);
  }

  actualizar_contraste(event: Event): void {
    this.requiere_contraste.set((event.target as HTMLInputElement).checked);
  }

  actualizar_datos_clinicos(event: Event): void {
    this.datos_clinicos_apoyo.set((event.target as HTMLInputElement).value);
  }

  actualizar_observacion(event: Event): void {
    this.observacion_apoyo.set((event.target as HTMLInputElement).value);
  }

  abrir_modal(): void {
    this.limpiar_formulario();
    this.modal()?.open();
  }

  cerrar_modal(): void {
    this.limpiar_formulario();
    this.modal()?.close();
  }

  limpiar_formulario(): void {
    this.servicio_imagen_seleccionado.set(null);
    this.prioridad_apoyo_id.set(null);
    this.diagnostico_apoyo_id.set(null);
    this.datos_clinicos_apoyo.set('');
    this.observacion_apoyo.set('');
    this.requiere_contraste.set(false);
  }

  guardar(): void {
    const servicio = this.servicio_imagen_seleccionado();
    const prioridadId = this.prioridad_apoyo_id();
    const diagnosticoId = this.diagnostico_apoyo_id();

    if (!servicio || prioridadId === null || diagnosticoId === null) {
      return;
    }

    this.guardarSolicitud.emit({
      prioridad_id: prioridadId,
      diagnostico_id: diagnosticoId,
      servicio_codigo: servicio.codigo,
      requiere_contraste: this.requiere_contraste(),
      datos_clinicos: this.datos_clinicos_apoyo().trim(),
      observacion: this.observacion_apoyo().trim(),
    });

    this.limpiar_formulario();
    this.modal()?.close();
  }

  imprimir_orden(): void {
    const orden = this.orden_impresion_apoyo()?.nativeElement;
    if (!orden) {
      return;
    }

    const ventana = window.open('', '_blank', 'height=850,width=700');
    if (!ventana) {
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Orden de apoyo diagnóstico</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 13px; color: #222; }
            h4 { margin: 0 0 10px 0; font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 5px; text-transform: uppercase; }
            p { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>${orden.innerHTML}</body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  }
}
