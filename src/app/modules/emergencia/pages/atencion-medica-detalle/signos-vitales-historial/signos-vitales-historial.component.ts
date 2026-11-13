import { CommonModule } from '@angular/common';
import {
  Component,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { EChartsOption } from 'echarts';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { ContainerGraficComponent } from '../../../../../components/container-grafic/container-grafic.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { ProgressBarsComponent } from '../../../../../components/progress-bars/progress-bars.component';
import { TableComponent } from '../../../../../components/table/table.component';
import { CatalogoParametroClinico } from '../../../../../interfaces/emergencia/catalogo-emergencia.interface';
import {
  ControlVitalHistorial,
  SignoVitalDetalleHistorial,
  TriajeDetalleRequest,
} from '../../../../../interfaces/emergencia/triaje.interface';
import {
  PaletteColor,
  TableCellContext,
  TableColumn,
} from '../../../../../interfaces/util.interface';
import { CatalogoEmergenciaService } from '../../../../../services/emergencia/catalogo-emergencia.service';
import { UtilService } from '../../../../../services/util.service';

type CampoSignoVital =
  'temperatura' | 'paSistolica' | 'paDiastolica' | 'saturacion' | 'fc' | 'fr' | 'peso' | 'talla';

@Component({
  selector: 'app-signos-vitales-historial',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ContainerGraficComponent,
    InputGroupComponent,
    ModalComponent,
    ProgressBarsComponent,
    TableComponent,
  ],
  templateUrl: './signos-vitales-historial.component.html',
  styleUrl: './signos-vitales-historial.component.scss',
})
export class SignosVitalesHistorialComponent {
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly utilService = inject(UtilService);

  readonly historial = input<ControlVitalHistorial[]>([]);
  readonly edad = input<number | null>(null);
  readonly cargando = input(false);
  readonly guardando = input(false);
  readonly habilitado = input(false);
  readonly errorGuardado = input<string | null>(null);

  readonly registrar = output<{ detalles: TriajeDetalleRequest[]; observaciones: string | null }>();

  private readonly modal = viewChild<ModalComponent>('modal');

  private readonly parametrosClinicos = signal<CatalogoParametroClinico[]>([]);
  private intentoGuardado = false;

  private readonly CAMPOS_VALIDABLES: {
    codigo: string;
    componente?: string;
    etiqueta: string;
    valor: () => string;
  }[] = [
    { codigo: 'TEMP', etiqueta: 'Temperatura', valor: () => this.temperatura },
    { codigo: 'PA', componente: 'PAS', etiqueta: 'PA sistólica', valor: () => this.paSistolica },
    { codigo: 'PA', componente: 'PAD', etiqueta: 'PA diastólica', valor: () => this.paDiastolica },
    { codigo: 'SATO2', etiqueta: 'Saturación de oxígeno', valor: () => this.saturacion },
    { codigo: 'FC', etiqueta: 'Frecuencia cardíaca', valor: () => this.fc },
    { codigo: 'FR', etiqueta: 'Frecuencia respiratoria', valor: () => this.fr },
    { codigo: 'PESO', etiqueta: 'Peso', valor: () => this.peso },
    { codigo: 'TALLA', etiqueta: 'Talla', valor: () => this.talla },
  ];

  temperatura = '';
  paSistolica = '';
  paDiastolica = '';
  saturacion = '';
  fc = '';
  fr = '';
  peso = '';
  talla = '';
  observaciones = '';

  readonly historialAscendente = computed(() => [...this.historial()].reverse());

  readonly opcionesGraficoEvolucion = computed<EChartsOption>(() => {
    const lista = this.historialAscendente();

    if (!lista || lista.length === 0) {
      return {
        title: {
          text: 'Sin registros de evolución',
          left: 'center',
          top: 'middle',
          textStyle: { color: '#6c757d', fontSize: 13, fontWeight: 'normal' },
        },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [],
      };
    }

    const categoriasX = lista.map((item) => {
      const horaStr = this.formatearHora(item.fecha_hora);
      return horaStr || '-';
    });

    const datosSistolica = lista.map((item) => this.valor(item.detalles, 'PA', 'PAS'));
    const datosFC = lista.map((item) => this.valor(item.detalles, 'FC'));
    const datosFR = lista.map((item) => this.valor(item.detalles, 'FR'));

    return {
      tooltip: {
        trigger: 'axis',
        appendTo: 'body',
        extraCssText: 'z-index: 999999 !important; box-shadow: 0 4px 14px rgba(0,0,0,0.15); border-radius: 6px; border: 1px solid #e5e7eb;',
        axisPointer: { type: 'line' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const reg = lista[idx];
          const origen = reg?.origen_nombre ? ` (${reg.origen_nombre})` : '';
          const fechaHora = reg?.fecha_hora ? `${this.formatearFecha(reg.fecha_hora)} ${this.formatearHora(reg.fecha_hora)}` : '';
          let html = `<div style="font-size:12px; font-weight:600; margin-bottom:4px;">${fechaHora}${origen}</div>`;
          for (const p of params) {
            if (p.value !== null && p.value !== undefined) {
              html += `<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:11px;">
                <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${p.color}; margin-right:5px;"></span>${p.seriesName}:</span>
                <b>${p.value}</b>
              </div>`;
            }
          }
          return html;
        },
      },
      legend: {
        data: ['TA Sistólica', 'FC (lpm)', 'FR (rpm)'],
        top: 2,
        icon: 'circle',
        itemGap: 16,
        textStyle: { fontSize: 11, color: '#374151', fontWeight: 600 },
      },
      grid: {
        top: 36,
        left: 36,
        right: 20,
        bottom: 24,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: categoriasX,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#4b5563', fontSize: 11, fontWeight: 500 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: (val: { max: number }) => Math.max(160, Math.ceil((val.max + 20) / 20) * 20),
        splitLine: {
          show: true,
          lineStyle: { color: '#f3f4f6', type: 'dashed' },
        },
        axisLabel: { color: '#6b7280', fontSize: 10 },
      },
      series: [
        {
          name: 'TA Sistólica',
          type: 'line',
          smooth: true,
          data: datosSistolica,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#1a56db' },
          lineStyle: { width: 2.5, color: '#1a56db' },
        },
        {
          name: 'FC (lpm)',
          type: 'line',
          smooth: true,
          data: datosFC,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#0e9f6e' },
          lineStyle: { width: 2.5, color: '#0e9f6e' },
        },
        {
          name: 'FR (rpm)',
          type: 'line',
          smooth: true,
          data: datosFR,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#7e3af2' },
          lineStyle: { width: 2.5, color: '#7e3af2' },
        },
      ],
    };
  });

  imc(): string {
    const valor = this.utilService.calculate_imc(this.peso, this.talla);
    return valor > 0 ? valor.toFixed(2) : '';
  }

  imcStatus(): PaletteColor {
    return this.utilService.imc_status(this.imc());
  }

  imcDescripcion(): string {
    const descripcion = this.utilService.imc_descripcion(this.imc());

    return descripcion === 'Peso normal' ? 'Normal' : descripcion || 'Sin clasificación';
  }

  private readonly tempTpl =
    viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('tempTpl');
  private readonly paTpl = viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('paTpl');
  private readonly satTpl =
    viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('satTpl');
  private readonly fcTpl = viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('fcTpl');
  private readonly frTpl = viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('frTpl');
  private readonly imcTpl =
    viewChild<TemplateRef<TableCellContext<ControlVitalHistorial>>>('imcTpl');

  readonly plantillasCelda = computed<
    Record<string, TemplateRef<TableCellContext<ControlVitalHistorial>>>
  >(() => {
    const plantillas: Record<string, TemplateRef<TableCellContext<ControlVitalHistorial>>> = {};
    const asignar = (
      clave: string,
      plantilla: TemplateRef<TableCellContext<ControlVitalHistorial>> | undefined,
    ): void => {
      if (plantilla) plantillas[clave] = plantilla;
    };

    asignar('temp', this.tempTpl());
    asignar('pa', this.paTpl());
    asignar('sato2', this.satTpl());
    asignar('fc', this.fcTpl());
    asignar('fr', this.frTpl());
    asignar('imc', this.imcTpl());

    return plantillas;
  });

  readonly columnas: TableColumn<ControlVitalHistorial>[] = [
    { key: 'origen_nombre', label: 'Atención en' },
    {
      key: 'fecha',
      label: 'Fecha',
      formatter: (_valor, fila) => this.formatearFecha(fila.fecha_hora),
    },
    {
      key: 'hora',
      label: 'Hora',
      formatter: (_valor, fila) => this.formatearHora(fila.fecha_hora),
    },
    { key: 'temp', label: 'T°' },
    { key: 'pa', label: 'PA' },
    { key: 'sato2', label: 'SatO₂' },
    { key: 'fc', label: 'FC' },
    { key: 'fr', label: 'FR' },
    {
      key: 'peso',
      label: 'Peso',
      formatter: (_valor, fila) => `${this.valor(fila.detalles, 'PESO') ?? '-'}`,
    },
    {
      key: 'talla',
      label: 'Talla',
      formatter: (_valor, fila) => `${this.valor(fila.detalles, 'TALLA') ?? '-'}`,
    },
    { key: 'imc', label: 'IMC' },
  ];

  constructor() {
    this.catalogoEmergenciaService.obtenerSignosVitales().subscribe({
      next: ({ data }) => this.parametrosClinicos.set(data.parametros),
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(
          error.message ?? 'No se pudieron cargar los parámetros clínicos.',
        );
      },
    });

    effect(() => {
      const terminoDeGuardar = !this.guardando();
      if (terminoDeGuardar && this.intentoGuardado) {
        this.intentoGuardado = false;
        if (!this.errorGuardado()) {
          this.modal()?.close();
          this.limpiar();
        }
      }
    });
  }

  valor(
    detalles: SignoVitalDetalleHistorial[],
    codigo: string,
    componente?: string,
  ): number | null {
    const detalle = detalles.find(
      (item) =>
        item.parametro_codigo === codigo && (!componente || item.componente_codigo === componente),
    );
    return detalle ? detalle.valor : null;
  }

  colorAlerta(
    detalles: SignoVitalDetalleHistorial[],
    codigo: string,
    componente?: string,
  ): PaletteColor {
    const detalle = detalles.find(
      (item) =>
        item.parametro_codigo === codigo && (!componente || item.componente_codigo === componente),
    );
    return this.utilService.color_alerta(detalle?.alerta_color ?? '') ?? 'secondary';
  }

  imcColorFila(detalles: SignoVitalDetalleHistorial[]): PaletteColor {
    const valor = this.imcFila(detalles);
    return valor === '-' ? 'secondary' : this.utilService.imc_status(valor);
  }

  imcFila(detalles: SignoVitalDetalleHistorial[]): string {
    const peso = this.valor(detalles, 'PESO');
    const talla = this.valor(detalles, 'TALLA');
    if (!peso || !talla) return '-';

    const valor = this.utilService.calculate_imc(peso, talla);
    return valor > 0 ? valor.toFixed(2) : '-';
  }

  estado(campo: 'TEMP' | 'SATO2' | 'FC' | 'FR'): PaletteColor {
    const valorPorCampo: Record<typeof campo, string> = {
      TEMP: this.temperatura,
      SATO2: this.saturacion,
      FC: this.fc,
      FR: this.fr,
    } as Record<typeof campo, string>;
    const rawValue = valorPorCampo[campo];
    const edad = this.edad() ?? 30;
    const maestro = this.utilService.estado_desde_maestro(
      campo,
      rawValue,
      edad,
      this.parametrosClinicos(),
    );
    if (maestro) return maestro;

    switch (campo) {
      case 'TEMP':
        return this.utilService.temperature_status(rawValue);
      case 'SATO2':
        return this.utilService.saturation_status(rawValue);
      case 'FC':
        return this.utilService.heart_rate_status(rawValue);
      case 'FR':
        return this.utilService.respiratory_rate_status(rawValue);
    }
  }

  private rangoAdmisible(
    codigo: string,
    componente?: string,
  ): { minimo: number | null; maximo: number | null } | null {
    const parametro = this.parametrosClinicos().find((item) => item.codigo === codigo);
    if (!parametro) return null;

    if (componente) {
      const detalleComponente = parametro.componentes.find((item) => item.codigo === componente);
      return detalleComponente
        ? { minimo: detalleComponente.puntaje_minimo, maximo: detalleComponente.puntaje_maximo }
        : null;
    }

    return { minimo: parametro.valor_minimo_admisible, maximo: parametro.valor_maximo_admisible };
  }

  fueraDeRango(codigo: string, raw: string, componente?: string): boolean {
    if (raw.trim() === '') return false;

    const valor = Number(raw);
    if (!Number.isFinite(valor)) return false;

    const rango = this.rangoAdmisible(codigo, componente);
    if (!rango) return false;

    return (
      (rango.minimo !== null && valor < rango.minimo) ||
      (rango.maximo !== null && valor > rango.maximo)
    );
  }

  mensajeRango(codigo: string, componente?: string): string {
    const rango = this.rangoAdmisible(codigo, componente);
    if (!rango) return 'Valor fuera de rango.';

    if (rango.minimo !== null && rango.maximo !== null) {
      return `Debe estar entre ${rango.minimo} y ${rango.maximo}.`;
    }
    if (rango.minimo !== null) return `Debe ser mayor o igual a ${rango.minimo}.`;
    if (rango.maximo !== null) return `Debe ser menor o igual a ${rango.maximo}.`;

    return 'Valor fuera de rango.';
  }

  camposFueraDeRango(): string[] {
    return this.CAMPOS_VALIDABLES.filter((campo) =>
      this.fueraDeRango(campo.codigo, campo.valor(), campo.componente),
    ).map((campo) => campo.etiqueta);
  }

  hayCamposFueraDeRango(): boolean {
    return this.camposFueraDeRango().length > 0;
  }

  estadoPresion(): PaletteColor {
    const edad = this.edad() ?? 30;
    return (
      this.utilService.estado_desde_maestro(
        'PA',
        this.paSistolica,
        edad,
        this.parametrosClinicos(),
      ) ?? this.utilService.systolic_status(this.paSistolica)
    );
  }

  estadoPresionDiastolica(): PaletteColor {
    return this.utilService.diastolic_status(this.paDiastolica);
  }

  actualizar_campo(campo: CampoSignoVital, valor: string | number | null | undefined): void {
    this[campo] = valor == null ? '' : String(valor);
  }

  actualizar_observaciones(event: Event): void {
    this.observaciones = (event.target as HTMLTextAreaElement).value;
  }

  progressBarClasses(color: PaletteColor): string {
    return this.utilService.progress_bar_classes(color);
  }

  abrir_modal(): void {
    this.precargar_antropometria_previa();
    this.modal()?.open();
  }

  cerrar_modal(): void {
    this.modal()?.close();
    this.limpiar();
  }

  agregar(): void {
    if (this.guardando()) return;

    const camposFueraDeRango = this.camposFueraDeRango();
    if (camposFueraDeRango.length > 0) {
      this.utilService.mostrar_alerta(
        `Hay valores fuera del rango admisible: ${camposFueraDeRango.join(', ')}.`,
        'warning',
      );
      return;
    }

    const detalles: TriajeDetalleRequest[] = [];
    let parametroNoDisponible: string | null = null;

    const add = (codigo: string, raw: string, componente: string | null = null): void => {
      if (raw.trim() === '') return;
      if (!this.parametroDisponible(codigo)) {
        parametroNoDisponible ??= codigo;
        return;
      }
      detalles.push({
        parametro_codigo: codigo,
        componente_codigo: componente,
        valor: Number(raw),
      });
    };

    add('TEMP', this.temperatura);
    add('FC', this.fc);
    add('FR', this.fr);
    add('SATO2', this.saturacion);
    add('PESO', this.peso);
    add('TALLA', this.talla);

    if (this.paSistolica || this.paDiastolica) {
      if (!this.paSistolica || !this.paDiastolica) {
        this.utilService.mostrar_alerta('Ingrese las presiones sistólica y diastólica.', 'warning');
        return;
      }
      add('PA', this.paSistolica, 'PAS');
      add('PA', this.paDiastolica, 'PAD');
    }

    if (parametroNoDisponible) {
      this.utilService.mostrar_alerta(
        `El parámetro clínico ${parametroNoDisponible} no está disponible.`,
        'warning',
      );
      return;
    }

    if (detalles.length === 0) {
      this.utilService.mostrar_alerta('Registre al menos un signo vital.', 'warning');
      return;
    }

    this.intentoGuardado = true;
    this.registrar.emit({ detalles, observaciones: this.observaciones.trim() || null });
  }

  formatearFecha(fechaHora: string): string {
    const fecha = new Date(fechaHora.replace(' ', 'T'));
    if (Number.isNaN(fecha.getTime())) return fechaHora;

    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatearHora(fechaHora: string): string {
    const fecha = new Date(fechaHora.replace(' ', 'T'));
    if (Number.isNaN(fecha.getTime())) return fechaHora;

    return fecha.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  private parametroDisponible(codigo: string): boolean {
    return this.parametrosClinicos().some((parametro) => parametro.codigo === codigo);
  }

  private precargar_antropometria_previa(): void {
    const lista = this.historial();
    if (!lista || lista.length === 0) return;

    const controlTriaje =
      lista.find((c) => c.origen_codigo === 'TRI') ?? lista[0];

    if (!controlTriaje?.detalles) return;

    const pesoPrevio = this.valor(controlTriaje.detalles, 'PESO');
    const tallaPrevia = this.valor(controlTriaje.detalles, 'TALLA');

    if (pesoPrevio !== null && pesoPrevio !== undefined) {
      this.peso = String(pesoPrevio);
    }
    if (tallaPrevia !== null && tallaPrevia !== undefined) {
      this.talla = String(tallaPrevia);
    }
  }

  private limpiar(): void {
    this.temperatura = '';
    this.paSistolica = '';
    this.paDiastolica = '';
    this.saturacion = '';
    this.fc = '';
    this.fr = '';
    this.peso = '';
    this.talla = '';
    this.observaciones = '';
  }
}
