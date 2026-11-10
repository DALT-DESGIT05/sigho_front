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
import { ButtonComponent } from '../../../../../../components/button/button.component';
import {
  AreaInterconsulta,
  DetalleAtencionResponse,
  Diagnostico,
  EspecialidadInterconsulta,
  OrdenInterconsulta,
  PersonalInterconsulta,
  PrioridadOrdenMedica,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../../../services/util.service';

export interface GuardarInterconsultaPayload {
  prioridad_id: number;
  diagnostico_id: number;
  especialidad_id: number;
  area_id: number;
  programacion_personal_id: number;
  que_solicita: string;
  observaciones: string;
}

@Component({
  selector: 'app-tab-interconsulta',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './tab-interconsulta.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabInterconsultaComponent {
  private readonly utilService = inject(UtilService);
  private readonly orden_impresion_interconsulta = viewChild<ElementRef<HTMLElement>>(
    'orden_impresion_interconsulta',
  );

  // Inputs
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly ordenes_interconsulta = input<readonly OrdenInterconsulta[]>([]);
  readonly areas_interconsulta = input<readonly AreaInterconsulta[]>([]);
  readonly especialidades_interconsulta = input<readonly EspecialidadInterconsulta[]>([]);
  readonly personal_interconsulta = input<readonly PersonalInterconsulta[]>([]);
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  readonly cargando_interconsultas = input(false);
  readonly guardando_interconsulta = input(false);

  // Outputs
  readonly guardarInterconsulta = output<GuardarInterconsultaPayload>();
  readonly eliminarInterconsulta = output<number>();

  // Estado reactivo interno
  readonly prioridad_interconsulta_id = signal<number | null>(null);
  readonly diagnostico_interconsulta_id = signal<number | null>(null);
  readonly especialidad_interconsulta_id = signal<number | null>(null);
  readonly area_interconsulta_id = signal<number | null>(null);
  readonly programacion_personal_interconsulta_id = signal<number | null>(null);
  readonly que_solicita_interconsulta = signal('');
  readonly observaciones_interconsulta = signal('');

  // Computeds
  readonly especialidades_filtradas = computed(() => {
    const areaId = this.area_interconsulta_id();
    if (areaId === null) {
      return [];
    }
    const todas = this.especialidades_interconsulta();
    // Filtro por area_id si viene mapeado desde el backend
    const porArea = todas.filter((esp) => esp.area_id === areaId);
    const listaBase = porArea.length > 0 ? porArea : todas;

    // Filtros demográficos clínicos (Sexo y Edad)
    const paciente = this.detalle().paciente;
    const sexo = (paciente?.sexo_codigo || '').toUpperCase();
    const edad = paciente?.edad ?? null;

    // IDs hardcodeados de especialidades según catálogo de SIGHOWEB
    const ESPEC_GINECO_OBSTETRICIA = [12, 79, 77]; // GINECOLOGIA, OBSTETRICIA, GINECOLOGIA ONCOLOGICA
    const ESPEC_PEDIATRICAS = [21, 66, 68, 65, 76, 80, 25, 34]; // PEDIATRIA, CIRUGIA PEDIATRA, CARDIOPEDIATRIA, etc.
    const ESPEC_GERIATRICAS = [30, 27, 28, 29, 58, 59]; // GERIATRIA, PSICOLOGIA GERIATRICA, etc.
    const ESPEC_NEONATOLOGIA = [51]; // NEONATOLOGIA

    return listaBase.filter((esp) => {
      // 1. Restricción por Sexo: Varones no deben ver gineco-obstetricia
      if (sexo === 'M' && ESPEC_GINECO_OBSTETRICIA.includes(esp.especialidad_id)) {
        return false;
      }

      // 2. Restricción por Edad
      if (edad !== null && edad !== undefined) {
        // Pacientes adultos (>= 18 años) no ven pediatría
        if (edad >= 18 && ESPEC_PEDIATRICAS.includes(esp.especialidad_id)) {
          return false;
        }

        // Pacientes menores de 60 años no ven geriatría
        if (edad < 60 && ESPEC_GERIATRICAS.includes(esp.especialidad_id)) {
          return false;
        }

        // Pacientes con más de 0 años (no recién nacidos) no ven neonatología
        if (edad > 0 && ESPEC_NEONATOLOGIA.includes(esp.especialidad_id)) {
          return false;
        }
      }

      return true;
    });
  });

  readonly personal_interconsulta_filtrado = computed(() => {
    const especialidadId = this.especialidad_interconsulta_id();
    if (especialidadId === null) {
      return [];
    }
    return this.personal_interconsulta().filter(
      (personal) => personal.especialidad_id === especialidadId,
    );
  });

  actualizar_area_interconsulta(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.area_interconsulta_id.set(value ? Number(value) : null);
    this.especialidad_interconsulta_id.set(null);
    this.programacion_personal_interconsulta_id.set(null);
  }

  actualizar_especialidad_interconsulta(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.especialidad_interconsulta_id.set(value ? Number(value) : null);
    this.programacion_personal_interconsulta_id.set(null);
  }

  actualizar_personal_interconsulta(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.programacion_personal_interconsulta_id.set(value ? Number(value) : null);
  }

  actualizar_diagnostico_interconsulta(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.diagnostico_interconsulta_id.set(value ? Number(value) : null);
  }

  seleccionar_prioridad_interconsulta(prioridad_id: number): void {
    this.prioridad_interconsulta_id.update((prev) => (prev === prioridad_id ? null : prioridad_id));
  }

  actualizar_que_solicita_interconsulta(event: Event): void {
    this.que_solicita_interconsulta.set((event.target as HTMLInputElement).value);
  }

  actualizar_observaciones_interconsulta(event: Event): void {
    this.observaciones_interconsulta.set((event.target as HTMLInputElement).value);
  }

  guardar(): void {
    const prioridad_id = this.prioridad_interconsulta_id();
    const diagnostico_id = this.diagnostico_interconsulta_id();
    const especialidad_id = this.especialidad_interconsulta_id();
    const area_id = this.area_interconsulta_id();
    const programacion_personal_id = this.programacion_personal_interconsulta_id();
    const que_solicita = this.que_solicita_interconsulta().trim();
    const observaciones = this.observaciones_interconsulta().trim();

    if (
      prioridad_id === null ||
      diagnostico_id === null ||
      especialidad_id === null ||
      area_id === null ||
      programacion_personal_id === null ||
      !que_solicita
    ) {
      return;
    }

    this.guardarInterconsulta.emit({
      prioridad_id,
      diagnostico_id,
      especialidad_id,
      area_id,
      programacion_personal_id,
      que_solicita,
      observaciones,
    });

    this.limpiar();
  }

  limpiar(): void {
    this.prioridad_interconsulta_id.set(null);
    this.diagnostico_interconsulta_id.set(null);
    this.especialidad_interconsulta_id.set(null);
    this.area_interconsulta_id.set(null);
    this.programacion_personal_interconsulta_id.set(null);
    this.que_solicita_interconsulta.set('');
    this.observaciones_interconsulta.set('');
  }

  imprimir_orden_interconsulta(): void {
    const orden = this.orden_impresion_interconsulta()?.nativeElement;
    if (!orden) return;
    this.imprimir_elemento(orden, 'Orden de interconsulta');
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
