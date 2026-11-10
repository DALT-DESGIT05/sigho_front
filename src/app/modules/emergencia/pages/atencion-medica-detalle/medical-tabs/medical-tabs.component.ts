import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { ButtonComponent } from '../../../../../components/button/button.component';
import { CheckToggleComponent } from '../../../../../components/check-toggle/check-toggle.component';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { FormularioRecetaMedicamentoComponent } from './formulario-receta-medicamento/formulario-receta-medicamento.component';
import { HistorialRecetasModalComponent } from './historial-recetas-modal/historial-recetas-modal.component';
import { TabDiagnosticosComponent, DiagnosticoItemPayload } from './tab-diagnosticos/tab-diagnosticos.component';
import { TabApoyoImagenComponent, GuardarApoyoImagenPayload } from './tab-apoyo-imagen/tab-apoyo-imagen.component';
import { TabLaboratorioComponent, GuardarLaboratorioPayload } from './tab-laboratorio/tab-laboratorio.component';
import { TabProcedEnfComponent, GuardarProcedEnfPayload } from './tab-proced-enf/tab-proced-enf.component';
import { TabInterconsultaComponent, GuardarInterconsultaPayload } from './tab-interconsulta/tab-interconsulta.component';
import { TabHospitalizacionComponent, GuardarHospitalizacionPayload } from './tab-hospitalizacion/tab-hospitalizacion.component';
import { TabEnfermedadComponent } from './tab-enfermedad/tab-enfermedad.component';
import { TabEvaluacionComponent } from './tab-evaluacion/tab-evaluacion.component';
import { TabRecetaComponent } from './tab-receta/tab-receta.component';

import {
  Farmacia,
  RecetaMedica,
} from '../../../../../interfaces/emergencia/receta.interface';
import {
  AreaInterconsulta,
  DetalleAtencionResponse,
  Diagnostico,
  DiagnosticoCatalogo,
  EspecialidadInterconsulta,
  EstadoExamenRegional,
  EvaluacionMedicaData,
  ExamenRegional,
  FuncionBiologica,
  MotivoHospitalizacion,
  OrdenHistorialLaboratorio,
  OrdenHospitalizacion,
  OrdenImagen,
  OrdenInterconsulta,
  OrdenLaboratorio,
  OrdenProcedEnf,
  OrdenResultadoLaboratorio,
  PersonalInterconsulta,
  PrioridadOrdenMedica,
  ServicioImagen,
  ServicioLaboratorio,
  ServicioProcedEnf,
  TipoDiagnostico,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { RecetaEmergenciaService } from '../../../../../services/emergencia/receta.service';
import { UtilService } from '../../../../../services/util.service';

@Component({
  selector: 'app-medical-tabs',
  standalone: true,
  imports: [
    CommonModule,
    TabDiagnosticosComponent,
    TabApoyoImagenComponent,
    TabLaboratorioComponent,
    TabProcedEnfComponent,
    TabInterconsultaComponent,
    TabHospitalizacionComponent,
    TabEnfermedadComponent,
    TabEvaluacionComponent,
    TabRecetaComponent,
  ],
  templateUrl: './medical-tabs.component.html',
  styleUrl: './medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicalTabsComponent {
  private readonly utilService = inject(UtilService);
  private readonly orden_impresion_interconsulta = viewChild<ElementRef<HTMLElement>>(
    'orden_impresion_interconsulta',
  );
  private readonly orden_impresion_hospitalizacion = viewChild<ElementRef<HTMLElement>>(
    'orden_impresion_hospitalizacion',
  );
  private readonly proced_enf_modal = viewChild<ModalComponent>('proced_enf_modal');
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly formulario = input.required<EvaluacionMedicaData>();
  readonly evaluacion_registrada = input(false);
  readonly funciones_biologicas = input<readonly FuncionBiologica[]>([]);
  readonly cargando_funciones_biologicas = input(false);
  readonly examenes_regionales = input<readonly ExamenRegional[]>([]);
  readonly estados_examen_regional = input<readonly EstadoExamenRegional[]>([]);
  readonly cargando_examenes_regionales = input(false);
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly tipos_diagnostico = input<readonly TipoDiagnostico[]>([]);
  readonly resultados_diagnostico = input<readonly DiagnosticoCatalogo[]>([]);
  readonly buscando_diagnostico = input(false);
  readonly cargando_diagnosticos = input(false);
  readonly guardando_diagnostico = input(false);
  readonly ordenes_imagen = input<readonly OrdenImagen[]>([]);
  readonly prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  readonly resultados_servicio_imagen = input<readonly ServicioImagen[]>([]);
  readonly cargando_apoyos_diagnosticos = input(false);
  readonly buscando_servicio_imagen = input(false);
  readonly guardando_apoyo_diagnostico = input(false);
  readonly ordenes_laboratorio = input<readonly OrdenLaboratorio[]>([]);
  readonly catalogo_laboratorio = input<readonly ServicioLaboratorio[]>([]);
  readonly cargando_laboratorio = input(false);
  readonly guardando_laboratorio = input(false);
  readonly historial_laboratorio = input<readonly OrdenHistorialLaboratorio[]>([]);
  readonly resultados_laboratorio = input<readonly OrdenResultadoLaboratorio[]>([]);
  readonly cargando_historial_laboratorio = input(false);
  readonly cargando_resultados_laboratorio = input(false);
  readonly ordenes_proced_enf = input<readonly OrdenProcedEnf[]>([]);
  readonly catalogo_proced_enf = input<readonly ServicioProcedEnf[]>([]);
  readonly cargando_proced_enf = input(false);
  readonly guardando_proced_enf = input(false);
  readonly ordenes_hospitalizacion = input<readonly OrdenHospitalizacion[]>([]);
  readonly motivos_hospitalizacion = input<readonly MotivoHospitalizacion[]>([]);
  readonly cargando_hospitalizacion = input(false);
  readonly guardando_hospitalizacion = input(false);
  readonly ordenes_interconsulta = input<readonly OrdenInterconsulta[]>([]);
  readonly areas_interconsulta = input<readonly AreaInterconsulta[]>([]);
  readonly especialidades_interconsulta = input<readonly EspecialidadInterconsulta[]>([]);
  readonly personal_interconsulta = input<readonly PersonalInterconsulta[]>([]);
  readonly cargando_interconsultas = input(false);
  readonly guardando_interconsulta = input(false);
  readonly pestana_activa = model('enfermedad');
  readonly guardando = input(false);
  readonly cargando = input(false);

  readonly validacion_evaluacion_solicitada = signal(false);
  readonly validacion_enfermedad_solicitada = signal(false);
  readonly campoActualizado = output<{ campo: keyof EvaluacionMedicaData; event: Event }>();
  readonly guardar = output<Event>();
  readonly guardarEnfermedad = output<Event>();
  readonly guardarEvaluacion = output<Event>();
  readonly tipoRegionalActualizado = output<1 | 2>();
  readonly buscarDiagnostico = output<string>();
  readonly guardarDiagnostico = output<DiagnosticoItemPayload[]>();
  readonly eliminarDiagnostico = output<number>();
  readonly buscarServicioImagen = output<string>();
  readonly guardarApoyoImagen = output<GuardarApoyoImagenPayload>();
  readonly eliminarApoyoImagen = output<number>();
  readonly guardarLaboratorio = output<GuardarLaboratorioPayload>();
  readonly eliminarLaboratorio = output<number>();
  readonly cargarHistorialLaboratorio = output<void>();
  readonly cargarResultadosLaboratorio = output<void>();
  readonly guardarProcedEnf = output<{
    prioridad_id: number;
    servicios: Array<{ codigo: string; indicaciones?: string | null }>;
  }>();
  readonly eliminarProcedEnf = output<number>();
  readonly guardarHospitalizacion = output<{
    diagnostico_id: number;
    motivo_id: number;
    observacion: string;
  }>();
  readonly eliminarHospitalizacion = output<number>();
  readonly eliminarInterconsulta = output<number>();
  readonly guardarInterconsulta = output<{
    prioridad_id: number;
    diagnostico_id: number;
    especialidad_id: number;
    area_id: number;
    programacion_personal_id: number;
    que_solicita: string;
    observaciones: string;
  }>();


  // --- Funciones Biológicas ---
  seleccionar_estado(
    funcion: FuncionBiologica,
    estado: 'CONSER' | 'AUMEN' | 'DISMIN',
    event: Event,
  ): void {
    const seleccionado = (event.target as HTMLInputElement).checked;

    if (!seleccionado) {
      if (funcion.estado_codigo === estado) {
        funcion.estado_codigo = null;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      }
      return;
    }

    funcion.estado_codigo = estado;
    funcion.estado_id = null;
    funcion.estado_nombre = null;
  }

  alternar_todos_funcion(estado: 'CONSER' | 'AUMEN' | 'DISMIN'): void {
    const todosMarcados = this.funciones_biologicas().every(
      (funcion) => funcion.estado_codigo === estado,
    );

    for (const funcion of this.funciones_biologicas()) {
      if (!todosMarcados) {
        funcion.estado_codigo = estado;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      } else if (funcion.estado_codigo === estado) {
        funcion.estado_codigo = null;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      }
    }
  }

  actualizar_observacion(funcion: FuncionBiologica, event: Event): void {
    funcion.observacion = (event.target as HTMLInputElement).value;
  }

  // --- Examen Regional ---
  seleccionar_tipo_regional(tipo: 1 | 2): void {
    if (this.evaluacion_registrada()) return;

    this.tipoRegionalActualizado.emit(tipo);
  }

  seleccionar_estado_regional(
    examen: ExamenRegional,
    tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO',
    event: Event,
  ): void {
    const seleccionado = (event.target as HTMLInputElement).checked;

    if (!seleccionado) {
      if (examen.estado_tipo === tipo) {
        examen.estado_id = null;
        examen.estado_codigo = null;
        examen.estado_nombre = null;
        examen.estado_tipo = null;
      }
      return;
    }

    const estado = this.estados_examen_regional().find((item) => item.estado_tipo === tipo);
    examen.estado_id = estado?.estado_id ?? null;
    examen.estado_codigo = estado?.estado_codigo ?? null;
    examen.estado_nombre = estado?.estado_nombre ?? null;
    examen.estado_tipo = tipo;

    if (tipo === 'CONSERVADO') {
      examen.observacion = null;
    }
  }

  actualizar_observacion_regional(examen: ExamenRegional, event: Event): void {
    examen.observacion = (event.target as HTMLInputElement).value;
  }

  alternar_todos_regional(tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO'): void {
    const todosMarcados = this.examenes_regionales().every(
      (examen) => examen.estado_tipo === tipo,
    );

    const estado = this.estados_examen_regional().find((item) => item.estado_tipo === tipo);

    for (const examen of this.examenes_regionales()) {
      if (!todosMarcados) {
        examen.estado_id = estado?.estado_id ?? null;
        examen.estado_codigo = estado?.estado_codigo ?? null;
        examen.estado_nombre = estado?.estado_nombre ?? null;
        examen.estado_tipo = tipo;
        if (tipo === 'CONSERVADO') {
          examen.observacion = null;
        }
      } else if (examen.estado_tipo === tipo) {
        examen.estado_id = null;
        examen.estado_codigo = null;
        examen.estado_nombre = null;
        examen.estado_tipo = null;
      }
    }
  }

  campo_evaluacion_invalido(campo: keyof EvaluacionMedicaData): boolean {
    if (!this.validacion_evaluacion_solicitada()) return false;

    return !String(this.formulario()[campo] ?? '').trim();
  }

  clasificacion_regional_invalida(examen: ExamenRegional): boolean {
    return this.validacion_evaluacion_solicitada() && examen.estado_id === null;
  }

  observacion_regional_invalida(examen: ExamenRegional): boolean {
    return (
      this.validacion_evaluacion_solicitada() &&
      (examen.estado_tipo === 'PATOLOGICO' || examen.estado_tipo === 'NO_EVALUADO') &&
      !examen.observacion?.trim()
    );
  }

  texto_observacion_regional(examen: ExamenRegional): string {
    return examen.estado_tipo === 'NO_EVALUADO'
      ? 'Indique la causa de no evaluación'
      : 'Ingrese la observación clínica';
  }

  solicitar_guardado_enfermedad(event: Event): void {
    event.preventDefault();
    this.validacion_enfermedad_solicitada.set(true);

    const formulario = this.formulario();
    const obligatorios = [
      formulario.tiempo_enfermedad,
      formulario.motivo_consulta,
      formulario.anamnesis,
    ];

    if (obligatorios.some((valor) => !valor.trim())) {
      this.utilService.mostrar_alerta(
        'Complete los campos obligatorios de la enfermedad actual.',
        'warning',
      );
      return;
    }

    this.guardarEnfermedad.emit(event);
  }

  solicitar_guardado_evaluacion(event: Event): void {
    event.preventDefault();
    this.validacion_evaluacion_solicitada.set(true);

    const formulario = this.formulario();
    if (!formulario.signos_y_sintomas?.trim()) {
      this.utilService.mostrar_alerta(
        'Ingrese el examen clínico.',
        'warning',
      );
      return;
    }

    if (formulario.tipo_reg_evaluac === 2 && !formulario.examen_regional?.trim()) {
      this.utilService.mostrar_alerta(
        'Describa el examen físico regional.',
        'warning',
      );
      return;
    }

    if (formulario.tipo_reg_evaluac === 1) {
      const examenesIncompletos = this.examenes_regionales().some(
        (examen) =>
          this.clasificacion_regional_invalida(examen) ||
          this.observacion_regional_invalida(examen),
      );

      if (examenesIncompletos) {
        this.utilService.mostrar_alerta(
          'Debe clasificar todos los sistemas del examen físico regional.',
          'warning',
        );
        return;
      }
    }

    this.guardarEvaluacion.emit(event);
  }

  // --- Impresión Genérica ---
  private imprimir_elemento(elemento: HTMLElement, titulo: string): void {
    const ventana = window.open('', '_blank', 'height=850,width=700');
    if (!ventana) {
      this.utilService.mostrar_alerta(
        'Permita las ventanas emergentes para imprimir la orden.',
        'warning',
      );
      return;
    }

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((item) => item.outerHTML)
      .join('');
    let impresion_iniciada = false;
    const imprimir = (): void => {
      if (impresion_iniciada) return;

      impresion_iniciada = true;
      ventana.focus();
      ventana.print();
    };
    ventana.addEventListener('load', imprimir, { once: true });
    ventana.document.write(
      `<!doctype html><html><head><base href="${document.baseURI}"><title>${titulo}</title>${estilos}<style>@page{size:A5 portrait;margin:10mm}body{margin:0;padding:1rem}.laboratory-print-area,.apoyo-print-area,.interconsulta-print-area,.hospitalizacion-print-area{display:block!important}table{width:100%;border-collapse:collapse}th,td{border:1px solid #adb5bd;padding:4px 6px;font-size:12px;text-align:left}h4,h5{margin:0 0 6px}</style></head><body>${elemento.outerHTML}</body></html>`,
    );
    ventana.document.close();
    if (ventana.document.readyState === 'complete') {
      ventana.setTimeout(imprimir);
    }
  }

  readonly pestanas = [
    ['enfermedad', 'Enfermedad Actual'],
    ['evaluacion', 'Evaluación'],
    ['diagnosticos', 'Diagnósticos y Procedimiento'],
    ['apoyo', 'Ex. Apoyo Dx.'],
    ['proced_enf', 'Indicaciones Med.'],
    ['laboratorio', 'Laboratorio'],
    ['interconsulta', 'Interconsulta'],
    ['hospitalizacion', 'Hospitalización'],
    ['receta', 'Receta Medica'],
  ] as const;

  seleccionar_pestana(id: string): void {
    this.pestana_activa.set(id);
  }

  actualizar(campo: keyof EvaluacionMedicaData, event: Event): void {
    this.campoActualizado.emit({ campo, event });
  }
}
