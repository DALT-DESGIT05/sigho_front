import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { InputTextComponent } from '../../../../../../components/input-text/input-text.component';
import { SelectComponent, SelectOption, SelectValue } from '../../../../../../components/select/select.component';
import { TableComponent } from '../../../../../../components/table/table.component';
import {
  TableCellContext,
  TableColumn,
} from '../../../../../../interfaces/util.interface';
import {
  DetalleAtencionResponse,
  Diagnostico,
  MotivoHospitalizacion,
  OrdenHospitalizacion,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { HospitalizacionService } from '../../../../../../services/emergencia/hospitalizacion.service';
import { UtilService } from '../../../../../../services/util.service';

export interface GuardarHospitalizacionPayload {
  diagnostico_id: number;
  motivo_id: number;
  observacion: string;
}

@Component({
  selector: 'app-tab-hospitalizacion',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TableComponent, SelectComponent, InputTextComponent],
  templateUrl: './tab-hospitalizacion.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabHospitalizacionComponent {
  private readonly hospitalizacionService = inject(HospitalizacionService);
  private readonly utilService = inject(UtilService);
  private readonly orden_impresion_hospitalizacion = viewChild<ElementRef<HTMLElement>>(
    'orden_impresion_hospitalizacion',
  );

  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly ordenes_hospitalizacion = input<readonly OrdenHospitalizacion[]>([]);
  readonly motivos_hospitalizacion = input<readonly MotivoHospitalizacion[]>([]);
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly cargando_hospitalizacion = input(false);
  readonly guardando_hospitalizacion = input(false);

  readonly guardarHospitalizacion = output<GuardarHospitalizacionPayload>();
  readonly eliminarHospitalizacion = output<number>();

  private readonly accionesTpl =
    viewChild<TemplateRef<TableCellContext<OrdenHospitalizacion>>>('accionesTpl');

  readonly plantillasCelda = computed<
    Record<string, TemplateRef<TableCellContext<OrdenHospitalizacion>>>
  >(() => {
    const plantillas: Record<string, TemplateRef<TableCellContext<OrdenHospitalizacion>>> = {};
    const acc = this.accionesTpl();
    if (acc) plantillas['acciones'] = acc;
    return plantillas;
  });

  readonly columnasOrdenes: TableColumn<OrdenHospitalizacion>[] = [
    {
      key: 'diagnostico',
      label: 'DIAGNÓSTICO',
      formatter: (_val, fila) =>
        fila.diagnostico_codigo
          ? `${fila.diagnostico_codigo} - ${fila.diagnostico_nombre}`
          : fila.diagnostico_nombre || '-',
    },
    {
      key: 'motivo_nombre',
      label: 'MOTIVO',
      formatter: (_val, fila) => fila.motivo_nombre || '-',
    },
    {
      key: 'observacion',
      label: 'OBSERVACIÓN',
      formatter: (_val, fila) => fila.observacion || '-',
    },
    {
      key: 'fecha_registro',
      label: 'FECHA REGISTRO',
      formatter: (_val, fila) => fila.fecha_registro || '-',
    },
    {
      key: 'acciones',
      label: 'ACCIONES',
      align: 'center',
    },
  ];

  readonly diagnostico_hospitalizacion_id = signal<number | null>(null);
  readonly motivo_hospitalizacion_id = signal<number | null>(null);
  readonly observacion_hospitalizacion = signal('');

  readonly diagnosticosOptions = computed<SelectOption[]>(() => {
    return this.diagnosticos().map((d) => ({
      value: d.diagnostico_id,
      label: `${d.codigo} - ${d.descripcion}`,
    }));
  });

  actualizar_diagnostico_hospitalizacion_valor(value: SelectValue): void {
    this.diagnostico_hospitalizacion_id.set(value ? Number(value) : null);
  }

  actualizar_observacion_texto(value: string | number | null | undefined): void {
    this.observacion_hospitalizacion.set(value !== null && value !== undefined ? String(value) : '');
  }

  actualizar_diagnostico_hospitalizacion(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.diagnostico_hospitalizacion_id.set(value ? Number(value) : null);
  }

  seleccionar_motivo_hospitalizacion(motivo_id: number): void {
    this.motivo_hospitalizacion_id.update((prev) => (prev === motivo_id ? null : motivo_id));
  }

  actualizar_observacion_hospitalizacion(event: Event): void {
    this.observacion_hospitalizacion.set((event.target as HTMLInputElement).value);
  }

  guardar(): void {
    const diagnostico_id = this.diagnostico_hospitalizacion_id();
    const motivo_id = this.motivo_hospitalizacion_id();

    if (diagnostico_id === null || motivo_id === null) {
      return;
    }

    this.guardarHospitalizacion.emit({
      diagnostico_id,
      motivo_id,
      observacion: this.observacion_hospitalizacion().trim(),
    });

    this.limpiar();
  }

  limpiar(): void {
    this.diagnostico_hospitalizacion_id.set(null);
    this.motivo_hospitalizacion_id.set(null);
    this.observacion_hospitalizacion.set('');
  }

  imprimir_orden_hospitalizacion(): void {
    const atencionId = this.detalle()?.atencion_id;
    if (!atencionId) {
      this.utilService.mostrar_alerta('No se identificó la atención médica para generar el PDF.', 'warning');
      return;
    }

    this.hospitalizacionService.descargar_reporte_pdf(atencionId, true).subscribe({
      next: (pdf: Blob) => {
        const url = window.URL.createObjectURL(pdf);
        window.open(url, '_blank');
      },
      error: () => {
        this.utilService.mostrar_error('No se pudo generar la orden de hospitalización.');
      },
    });
  }

  private imprimir_elemento(elemento: HTMLElement, titulo: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`<!doctype html><html><head><base href="${document.baseURI}"><title>${titulo}</title>${estilos}<style>@page{size:A5 portrait;margin:10mm}body{margin:0;padding:1rem}.laboratory-print-area,.hospitalization-print-area{display:block!important;position:static!important}.laboratory-print-document{display:block!important}</style></head><body>${elemento.outerHTML}</body></html>`);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 250);
  }
}
