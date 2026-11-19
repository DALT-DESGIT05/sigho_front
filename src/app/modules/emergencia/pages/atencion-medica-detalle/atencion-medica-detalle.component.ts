import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, firstValueFrom } from 'rxjs';
import { MESSAGE_CONFIRMATION_DEFAULT, TITLE_MODAL } from '../../../../config/constants';
import { ButtonComponent } from '../../../../components/button/button.component';
import { MenuFlotanteComponent } from '../../../../components/menu-flotante/menu-flotante.component';
import { MenuFlotanteOption } from '../../../../components/menu-flotante/menu-flotante-option.interface';
import { ModalComponent } from '../../../../components/modal/modal.component';
import {
  SelectComponent,
  SelectOption,
  SelectValue,
} from '../../../../components/select/select.component';
import { AltaPacienteComponent, GuardarAltaEvent } from './alta-paciente/alta-paciente.component';
import { MedicalTabsComponent } from './medical-tabs/medical-tabs.component';
import { EmergencyPatientCardComponent } from './emergency-patient-card/emergency-patient-card.component';
import { SignosVitalesHistorialComponent } from './signos-vitales-historial/signos-vitales-historial.component';
import { AntecedentesComponent } from './antecedentes/antecedentes.component';
import { HojaLesionesModalComponent } from './hoja-lesiones-modal/hoja-lesiones-modal.component';
import {
  DetalleAtencionResponse,
  EvaluacionMedicaData,
  EvaluacionMedicaResponse,
  FuncionBiologica,
  ExamenRegional,
  EstadoExamenRegional,
  Diagnostico,
  DiagnosticoCatalogo,
  TipoDiagnostico,
  ApoyoDiagnosticoContexto,
  OrdenImagen,
  PrioridadOrdenMedica,
  ServicioImagen,
  LaboratorioContexto,
  OrdenLaboratorio,
  OrdenHistorialLaboratorio,
  OrdenResultadoLaboratorio,
  HistorialLaboratorioContexto,
  ResultadosLaboratorioContexto,
  OrdenProcedEnf,
  ProcedEnfContexto,
  OrdenHospitalizacion,
  MotivoHospitalizacion,
  HospitalizacionContexto,
  InterconsultaContexto,
  OrdenInterconsulta,
  AreaInterconsulta,
  AlergiaPaciente,
  EspecialidadInterconsulta,
  PersonalInterconsulta,
  ControlVitalHistorial,
  TriajeDetalleRequest,
  DestinoCierreAtencion,
} from '../../../../interfaces/emergencia/triaje.interface';
import { DiagnosticoService } from '../../../../services/emergencia/diagnostico.service';
import { EvaluacionService } from '../../../../services/emergencia/evaluacion.service';
import { AlergiaService } from '../../../../services/emergencia/alergia.service';
import { HospitalizacionService } from '../../../../services/hospitalizacion/hospitalizacion.service';
import { ImagenService } from '../../../../services/imagenologia/imagen.service';
import { InterconsultaService } from '../../../../services/emergencia/interconsulta.service';
import { LaboratorioService } from '../../../../services/laboratorio/laboratorio.service';
import { ProcedimientoEnfermeriaService } from '../../../../services/emergencia/procedimiento-enfermeria.service';
import { SignosVitalesService } from '../../../../services/emergencia/signos-vitales.service';
import { CierreAtencionService } from '../../../../services/emergencia/cierre-atencion.service';
import { DescansoMedicoService } from '../../../../services/emergencia/descanso-medico.service';
import { AltaPacienteService } from '../../../../services/hospitalizacion/alta-paciente.service';
import { LesionService } from '../../../../services/emergencia/lesion.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'app-atencion-medica-detalle',
  imports: [
    AltaPacienteComponent,
    ButtonComponent,
    MenuFlotanteComponent,
    MedicalTabsComponent,
    EmergencyPatientCardComponent,
    ModalComponent,
    SelectComponent,
    SignosVitalesHistorialComponent,
    AntecedentesComponent,
    HojaLesionesModalComponent,
  ],
  templateUrl: './atencion-medica-detalle.component.html',
  styleUrl: './atencion-medica-detalle.component.scss',
})
export class AtencionMedicaDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);
  private readonly diagnosticoService = inject(DiagnosticoService);
  private readonly evaluacionService = inject(EvaluacionService);
  private readonly alergiaService = inject(AlergiaService);
  private readonly hospitalizacionService = inject(HospitalizacionService);
  private readonly imagenService = inject(ImagenService);
  private readonly interconsultaService = inject(InterconsultaService);
  private readonly laboratorioService = inject(LaboratorioService);
  private readonly procedimientoEnfermeriaService = inject(ProcedimientoEnfermeriaService);
  private readonly signosVitalesService = inject(SignosVitalesService);
  private readonly cierreAtencionService = inject(CierreAtencionService);
  private readonly descansoMedicoService = inject(DescansoMedicoService);
  private readonly altaPacienteService = inject(AltaPacienteService);
  private readonly lesionService = inject(LesionService);
  private readonly utilService = inject(UtilService);
  private readonly antecedentes = viewChild<AntecedentesComponent>('antecedentes');
  private readonly hojaLesionesModal = viewChild(HojaLesionesModalComponent);
  private readonly modalDestino = viewChild<ModalComponent>('modalDestino');
  private readonly modalAlta = viewChild<ModalComponent>('modalAlta');

  readonly guardandoAlta = signal<boolean>(false);
  readonly tiene_hoja_lesiones = signal<boolean>(false);

  readonly atencion = signal<DetalleAtencionResponse | null>(null);
  readonly evaluacion = signal<EvaluacionMedicaResponse | null>(null);
  readonly funciones_biologicas = signal<FuncionBiologica[]>([]);
  readonly examenes_regionales = signal<ExamenRegional[]>([]);
  readonly estados_examen_regional = signal<EstadoExamenRegional[]>([]);
  readonly diagnosticos = signal<Diagnostico[]>([]);
  readonly tipos_diagnostico = signal<TipoDiagnostico[]>([]);
  readonly clasificaciones_diagnostico = signal<TipoDiagnostico[]>([]);
  readonly resultados_diagnostico = signal<DiagnosticoCatalogo[]>([]);
  readonly ordenes_imagen = signal<OrdenImagen[]>([]);
  readonly prioridades_orden = signal<PrioridadOrdenMedica[]>([]);
  readonly resultados_servicio_imagen = signal<ServicioImagen[]>([]);
  readonly ordenes_laboratorio = signal<OrdenLaboratorio[]>([]);
  readonly catalogo_laboratorio = signal<LaboratorioContexto['catalogo']>([]);
  readonly historial_laboratorio = signal<OrdenHistorialLaboratorio[]>([]);
  readonly resultados_laboratorio = signal<OrdenResultadoLaboratorio[]>([]);
  readonly ordenes_proced_enf = signal<OrdenProcedEnf[]>([]);
  readonly catalogo_proced_enf = signal<ProcedEnfContexto['catalogo']>([]);
  readonly ordenes_hospitalizacion = signal<OrdenHospitalizacion[]>([]);
  readonly motivos_hospitalizacion = signal<MotivoHospitalizacion[]>([]);
  readonly ordenes_interconsulta = signal<OrdenInterconsulta[]>([]);
  readonly areas_interconsulta = signal<AreaInterconsulta[]>([]);
  readonly especialidades_interconsulta = signal<EspecialidadInterconsulta[]>([]);
  readonly personal_interconsulta = signal<PersonalInterconsulta[]>([]);
  readonly signos_vitales = signal<ControlVitalHistorial[]>([]);
  readonly alergias = signal<AlergiaPaciente[]>([]);
  readonly errorGuardadoSignosVitales = signal<string | null>(null);
  readonly paso_finalizacion = signal<'destino' | 'alta'>('destino');
  readonly destino_finalizacion = signal<SelectValue>(null);
  readonly destinos_cierre = signal<DestinoCierreAtencion[]>([]);
  readonly opciones_destino_finalizacion = computed<SelectOption[]>(() =>
    this.destinos_cierre().map((destino) => ({
      value: destino.cod_estado,
      label: destino.des_estado,
    })),
  );
  readonly evaluacion_form = signal<EvaluacionMedicaData>(this.formularioInicial());
  readonly evaluacion_regional_registrada = computed(() => {
    const eva = this.evaluacion();
    if (!eva) return false;
    const tieneTexto = !!eva.examen_regional && eva.examen_regional.trim().length > 0;
    const tieneExamenesEstructurados = this.examenes_regionales().some(
      (e) => e.estado_id !== null && e.estado_id !== undefined,
    );
    return tieneTexto || tieneExamenesEstructurados;
  });
  readonly cargando = signal(true);
  readonly cargandoEvaluacion = signal(false);
  readonly cargandoFuncionesBiologicas = signal(false);
  readonly cargandoExamenesRegionales = signal(false);
  readonly guardandoEvaluacion = signal(false);
  readonly guardandoDiagnostico = signal(false);
  readonly cargandoDiagnosticos = signal(false);
  readonly buscandoDiagnostico = signal(false);
  readonly buscandoServicioImagen = signal(false);
  readonly cargandoApoyosDiagnosticos = signal(false);
  readonly guardandoApoyoDiagnostico = signal(false);
  readonly cargandoLaboratorio = signal(false);
  readonly guardandoLaboratorio = signal(false);
  readonly cargandoHistorialLaboratorio = signal(false);
  readonly cargandoResultadosLaboratorio = signal(false);
  readonly cargandoProcedEnf = signal(false);
  readonly guardandoProcedEnf = signal(false);
  readonly cargandoHospitalizacion = signal(false);
  readonly guardandoHospitalizacion = signal(false);
  readonly cargandoInterconsultas = signal(false);
  readonly guardandoInterconsulta = signal(false);
  readonly cargandoSignosVitales = signal(false);
  readonly guardandoSignosVitales = signal(false);
  readonly iniciando_atencion = signal(false);
  readonly pestana_activa = signal('enfermedad');
  readonly detalle_vista = computed(() => this.atencion() ?? DETALLE_ATENCION_INICIAL);

  readonly atencion_cerrada = computed(() => this.detalle_vista().fecha_hora_egr !== null);

  readonly fecha_egreso_formateada = computed(() => {
    const fecha = this.detalle_vista().fecha_hora_egr;
    return fecha ? new Date(fecha.replace(' ', 'T')).toLocaleString('es-PE') : '';
  });

  readonly paciente_alta_nombre = computed<string>(() => {
    const pac = this.detalle_vista().paciente;
    if (!pac) return '';
    const grado = pac.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = pac.situacion?.toUpperCase()?.trim();
    const esTitular = Boolean(grado) || pac.parentesco?.toUpperCase()?.trim() === 'TITULAR';
    const sufijoSituacion = esTitular && grado && situacion === 'RETIRO' ? '(r)' : null;
    const partesGrado = [grado, sufijoSituacion].filter(Boolean).join(' ');

    let nombre = '';
    if (pac.apellido_paterno || pac.apellido_materno || pac.nombres) {
      const apellidos = [pac.apellido_paterno, pac.apellido_materno]
        .map((v) => v?.toUpperCase()?.trim())
        .filter(Boolean)
        .join(' ');
      const nombres = (pac.nombres || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
      nombre = [apellidos, nombres].filter(Boolean).join(' ');
    } else {
      nombre = pac.nombre_completo?.trim() || '';
    }

    return [partesGrado, nombre].filter(Boolean).join(' ');
  });

  readonly paciente_alta_datos = computed<string>(() => {
    const pac = this.detalle_vista().paciente;
    if (!pac) return '';
    const partes: string[] = [];
    if (pac.edad !== null && pac.edad !== undefined) {
      partes.push(`${pac.edad} años`);
    }
    if (pac.sexo) {
      partes.push(pac.sexo.toUpperCase());
    }
    if (pac.numero_historia) {
      partes.push(`HC:${pac.numero_historia}`);
    }
    return partes.join(' · ');
  });

  readonly es_caso_agresion = computed(() => {
    const detalle = this.detalle_vista();
    const motivo = (detalle.motivo_ingreso ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const motivoConsulta = (detalle.motivo_consulta ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return (
      motivo.includes('agres') ||
      motivoConsulta.includes('agres') ||
      detalle.motivo_ingreso_id === 3
    );
  });

  readonly acciones_clinicas = computed<MenuFlotanteOption[]>(() => {
    const esAgresion = this.es_caso_agresion();
    const opciones: MenuFlotanteOption[] = [
      { id: 'antecedentes', label: 'Antecedentes', icon: 'fa-solid fa-clipboard-list' },
      { id: 'historial_medico', label: 'Historial médico', icon: 'fa-solid fa-clock-rotate-left' },
    ];

    if (esAgresion) {
      const registrada = this.tiene_hoja_lesiones();
      opciones.push({
        id: 'hoja_lesiones',
        label: 'Agresión',
        icon: 'fa-solid fa-user-injured',
        variant: registrada ? undefined : 'parpadeo',
        tooltip: registrada
          ? 'Hoja médico-legal de lesiones registrada'
          : 'Paciente ingresó por agresión - Hoja médico-legal pendiente',
      });
    }

    opciones.push(
      { id: 'resultados', label: 'Resultados', icon: 'fa-solid fa-file-medical' },
      {
        id: 'hoja_atencion',
        label: 'Atención Médica',
        icon: 'fa-solid fa-file-lines',
        variant: 'destacada',
      },
      {
        id: 'descanso_medico',
        label: 'Descanso médico',
        icon: 'fa-solid fa-bed-pulse',
        tooltip: 'Ver o imprimir el certificado de descanso médico registrado',
      },
      { id: 'medicamentos', label: 'Medicamentos dispensados', icon: 'fa-solid fa-pills' },
    );

    if (!this.atencion_cerrada()) {
      opciones.push({
        id: 'finalizar',
        label: 'Finalizar atención',
        icon: 'fa-solid fa-circle-check',
        posicion: 'inferior',
        variant: 'advertencia',
      });
    }

    return opciones;
  });
  private readonly atencionId: number;
  private iniciar_atencion_al_abrir = false;
  private evaluacion_solicitada = false;
  private funciones_biologicas_solicitadas = false;
  private examenes_regionales_solicitados = false;
  private diagnosticos_solicitados = false;
  private apoyos_diagnosticos_solicitados = false;
  private laboratorio_solicitado = false;
  private historial_laboratorio_solicitado = false;
  private resultados_laboratorio_solicitado = false;
  private proced_enf_solicitado = false;
  private hospitalizacion_solicitada = false;
  private interconsultas_solicitadas = false;
  private signos_vitales_solicitados = false;

  constructor() {
    this.atencionId = Number(this.route.snapshot.paramMap.get('atencion_id'));
    this.iniciar_atencion_al_abrir = window.history.state?.iniciar_atencion === true;
    if (!Number.isInteger(this.atencionId) || this.atencionId < 1) {
      this.utilService.mostrar_error('La atención indicada no es válida.');
      void this.volver_a_cola();
      return;
    }

    effect(() => {
      const pestana = this.pestana_activa();

      if (pestana === 'enfermedad') {
        this.cargar_evaluacion();
        this.cargar_funciones_biologicas();
      } else if (pestana === 'evaluacion') {
        this.cargar_evaluacion();
        this.cargar_examenes_regionales();
      } else if (pestana === 'diagnosticos') {
        this.cargar_diagnosticos();
      } else if (pestana === 'apoyo') {
        this.cargar_diagnosticos();
        this.cargar_apoyos_diagnosticos();
      } else if (pestana === 'laboratorio') {
        this.cargar_diagnosticos();
        this.cargar_laboratorio();
      } else if (pestana === 'proced_enf') {
        this.cargar_proced_enf();
      } else if (pestana === 'hospitalizacion') {
        this.cargar_diagnosticos();
        this.cargar_hospitalizacion();
      } else if (pestana === 'interconsulta') {
        this.cargar_diagnosticos();
        this.cargar_interconsultas();
      } else if (pestana === 'receta') {
        this.cargar_diagnosticos();
      }
    });

    this.cargar_atencion();
  }

  actualizar_evaluacion(campo: keyof EvaluacionMedicaData, event: Event): void {
    const valor = (event.target as HTMLTextAreaElement).value;
    this.evaluacion_form.update((actual) => ({ ...actual, [campo]: valor }));
  }

  abrir_hoja_lesiones(): void {
    if (!this.es_caso_agresion()) {
      return;
    }
    this.hojaLesionesModal()?.abrir();
  }

  abrir_antecedentes_alergias(): void {
    this.antecedentes()?.abrir();
  }

  seleccionar_accion(accion: string): void {
    if (accion === 'antecedentes') {
      this.abrir_antecedentes_alergias();
      return;
    }

    if (accion === 'hoja_lesiones') {
      this.abrir_hoja_lesiones();
      return;
    }

    if (accion === 'hoja_atencion') {
      this.imprimir_hoja_atencion();
      return;
    }

    if (accion === 'descanso_medico') {
      this.ver_pdf_descanso_medico();
      return;
    }

    if (accion === 'finalizar') {
      if (this.atencion_cerrada()) return;
      void this.abrir_finalizacion();
      return;
    }

    const pestanaPorAccion: Record<string, string> = {
      historial_medico: 'enfermedad',
    };
    const pestana = pestanaPorAccion[accion];
    if (pestana) {
      this.pestana_activa.set(pestana);
      return;
    }

    this.utilService.mostrar_alerta(
      'Esta sección estará disponible al implementar su contrato clínico.',
      'info',
    );
  }

  guardar_enfermedad_actual(event: Event): void {
    event.preventDefault();
    if (this.guardandoEvaluacion()) return;

    if (!this.atencion()?.fecha_hora_llamada_med) {
      this.utilService.mostrar_alerta('Debe iniciar la atención desde la cola médica.', 'warning');
      return;
    }

    this.guardandoEvaluacion.set(true);
    this.evaluacionService
      .guardar_evaluacion(
        this.atencionId,
        this.evaluacion_form(),
        this.funciones_biologicas(),
        [],
        true,
      )
      .pipe(finalize(() => this.guardandoEvaluacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.evaluacion.set(data);
          this.evaluacion_form.set({
            tiempo_enfermedad: data.tiempo_enfermedad ?? '',
            motivo_consulta: data.motivo_consulta ?? '',
            anamnesis: data.anamnesis ?? '',
            examen_regional: data.examen_regional ?? '',
            signos_y_sintomas: data.signos_y_sintomas ?? '',
            relato: data.relato ?? '',
            plan_tratamiento: data.plan_tratamiento ?? '',
            tipo_reg_evaluac: data.tipo_reg_evaluac ?? 1,
          });
          this.utilService.mostrar_alerta('Enfermedad actual guardada correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo guardar la enfermedad actual.',
          ),
      });
  }

  guardar_evaluacion_clinica(event: Event): void {
    event.preventDefault();
    if (this.guardandoEvaluacion()) return;

    if (!this.atencion()?.fecha_hora_llamada_med) {
      this.utilService.mostrar_alerta('Debe iniciar la atención desde la cola médica.', 'warning');
      return;
    }

    this.guardandoEvaluacion.set(true);
    this.evaluacionService
      .guardar_evaluacion(
        this.atencionId,
        this.evaluacion_form(),
        [],
        this.examenes_regionales(),
        true,
      )
      .pipe(finalize(() => this.guardandoEvaluacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.evaluacion.set(data);
          this.evaluacion_form.set({
            tiempo_enfermedad: data.tiempo_enfermedad ?? '',
            motivo_consulta: data.motivo_consulta ?? '',
            anamnesis: data.anamnesis ?? '',
            examen_regional: data.examen_regional ?? '',
            signos_y_sintomas: data.signos_y_sintomas ?? '',
            relato: data.relato ?? '',
            plan_tratamiento: data.plan_tratamiento ?? '',
            tipo_reg_evaluac: data.tipo_reg_evaluac ?? 1,
          });
          this.utilService.mostrar_alerta('Evaluación clínica guardada correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo guardar la evaluación clínica.',
          ),
      });
  }

  guardar_evaluacion(event: Event): void {
    event.preventDefault();
    if (this.guardandoEvaluacion()) return;

    if (!this.atencion()?.fecha_hora_llamada_med) {
      this.utilService.mostrar_alerta('Debe iniciar la atención desde la cola médica.', 'warning');
      return;
    }

    this.guardandoEvaluacion.set(true);
    this.evaluacionService
      .guardar_evaluacion(
        this.atencionId,
        this.evaluacion_form(),
        this.funciones_biologicas(),
        this.examenes_regionales(),
        true,
      )
      .pipe(finalize(() => this.guardandoEvaluacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.evaluacion.set(data);
          this.evaluacion_form.set({
            tiempo_enfermedad: data.tiempo_enfermedad ?? '',
            motivo_consulta: data.motivo_consulta ?? '',
            anamnesis: data.anamnesis ?? '',
            examen_regional: data.examen_regional ?? '',
            signos_y_sintomas: data.signos_y_sintomas ?? '',
            relato: data.relato ?? '',
            plan_tratamiento: data.plan_tratamiento ?? '',
            tipo_reg_evaluac: data.tipo_reg_evaluac ?? 1,
          });
          this.utilService.mostrar_alerta('Evaluación médica guardada correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo guardar la evaluación médica.',
          ),
      });
  }

  imprimir_hoja_atencion(): void {
    this.evaluacionService.descargar_hoja_atencion(this.atencionId, true).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(
          error.message ?? 'No se pudo generar la Hoja de Atención de Emergencia.',
        );
      },
    });
  }

  private cargar_atencion(): void {
    this.cargando.set(true);
    this.triajeService
      .obtener_contexto_medico(this.atencionId)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.atencion.set(data);
          this.cargar_signos_vitales();
          this.cargar_alergias_inicial();
          this.iniciar_atencion_si_corresponde(data.fecha_hora_llamada_med);
          this.verificar_alerta_agresion();
        },
        error: (error: { message?: string }) => {
          this.utilService.mostrar_error(error.message ?? 'No se pudo consultar la atención.');
          void this.volver_a_cola();
        },
      });
  }

  on_hoja_lesiones_guardada(): void {
    this.tiene_hoja_lesiones.set(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(`agresion_alerta_vista_${this.atencionId}`, '1');
    }
  }

  private verificar_alerta_agresion(): void {
    if (!this.es_caso_agresion()) {
      return;
    }

    this.lesionService.obtener_lesiones(this.atencionId).subscribe({
      next: ({ data }) => {
        const yaRegistrada = Boolean(data && data.id_atencion_lesion);
        this.tiene_hoja_lesiones.set(yaRegistrada);

        if (yaRegistrada) {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(`agresion_alerta_vista_${this.atencionId}`, '1');
          }
          return;
        }

        const prompt_agresion = async () => {
          const yaVista =
            typeof window !== 'undefined' &&
            window.sessionStorage?.getItem(`agresion_alerta_vista_${this.atencionId}`) === '1';

          if (yaVista) {
            return;
          }

          const confirmed = await this.utilService.confirmar_accion({
            title: 'Paciente ingresó por agresión',
            text: 'El paciente fue registrado en triaje con motivo de agresión. ¿Desea llenar la Hoja de Registro de Lesiones ahora?',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fa-solid fa-user-injured me-1"></i> Llenar hoja de lesiones',
            cancelButtonText: 'Continuar atención normal',
            reverseButtons: true,
            allowOutsideClick: true,
          });

          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(`agresion_alerta_vista_${this.atencionId}`, '1');
          }

          if (confirmed) {
            this.abrir_hoja_lesiones();
          }
        };

        void prompt_agresion();
      },
      error: () => {
        const yaVista =
          typeof window !== 'undefined' &&
          window.sessionStorage?.getItem(`agresion_alerta_vista_${this.atencionId}`) === '1';
        if (yaVista) return;

        void this.utilService
          .confirmar_accion({
            title: 'Paciente ingresó por agresión',
            text: 'El paciente fue registrado en triaje con motivo de agresión. ¿Desea llenar la Hoja de Registro de Lesiones ahora?',
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fa-solid fa-user-injured me-1"></i> Llenar hoja de lesiones',
            cancelButtonText: 'Continuar atención normal',
            reverseButtons: true,
            allowOutsideClick: true,
          })
          .then((confirmed) => {
            if (typeof window !== 'undefined' && window.sessionStorage) {
              window.sessionStorage.setItem(`agresion_alerta_vista_${this.atencionId}`, '1');
            }
            if (confirmed) {
              this.abrir_hoja_lesiones();
            }
          });
      },
    });
  }

  private iniciar_atencion_si_corresponde(fecha_hora_llamada_med: string | null): void {
    if (!this.iniciar_atencion_al_abrir || fecha_hora_llamada_med || this.iniciando_atencion()) {
      return;
    }

    this.iniciar_atencion_al_abrir = false;
    this.iniciando_atencion.set(true);
    this.triajeService
      .iniciar_atencion(this.atencionId, true)
      .pipe(finalize(() => this.iniciando_atencion.set(false)))
      .subscribe({
        next: () => this.cargar_atencion(),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo iniciar la atención médica.'),
      });
  }

  private cargar_evaluacion(): void {
    if (this.evaluacion_solicitada) return;

    this.evaluacion_solicitada = true;
    this.cargandoEvaluacion.set(true);
    this.evaluacionService
      .obtener_evaluacion(this.atencionId)
      .pipe(finalize(() => this.cargandoEvaluacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.evaluacion.set(data);
          if (data) {
            this.evaluacion_form.set({
              tiempo_enfermedad: data.tiempo_enfermedad ?? '',
              motivo_consulta: data.motivo_consulta ?? '',
              anamnesis: data.anamnesis ?? '',
              examen_regional: data.examen_regional ?? '',
              signos_y_sintomas: data.signos_y_sintomas ?? '',
              relato: data.relato ?? '',
              plan_tratamiento: data.plan_tratamiento ?? '',
              tipo_reg_evaluac: data.tipo_reg_evaluac ?? 1,
            });
          }
        },
        error: (error: { message?: string }) => {
          this.evaluacion_solicitada = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar la evaluación médica.',
          );
        },
      });
  }

  private cargar_funciones_biologicas(): void {
    if (this.funciones_biologicas_solicitadas) return;

    this.funciones_biologicas_solicitadas = true;
    this.cargandoFuncionesBiologicas.set(true);
    this.evaluacionService
      .obtener_funciones_biologicas(this.atencionId)
      .pipe(finalize(() => this.cargandoFuncionesBiologicas.set(false)))
      .subscribe({
        next: ({ data }) => this.funciones_biologicas.set(data),
        error: (error: { message?: string }) => {
          this.funciones_biologicas_solicitadas = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las funciones biológicas.',
          );
        },
      });
  }

  private cargar_examenes_regionales(): void {
    if (this.examenes_regionales_solicitados) return;

    this.examenes_regionales_solicitados = true;
    this.cargandoExamenesRegionales.set(true);
    this.evaluacionService
      .obtener_examenes_regionales(this.atencionId)
      .pipe(finalize(() => this.cargandoExamenesRegionales.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.examenes_regionales.set(data.examenes_regionales);
          this.estados_examen_regional.set(data.estados);
          this.evaluacion_form.update((actual) => ({
            ...actual,
            tipo_reg_evaluac: data.tipo_reg_evaluac,
          }));
        },
        error: (error: { message?: string }) => {
          this.examenes_regionales_solicitados = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el examen regional.',
          );
        },
      });
  }

  private cargar_diagnosticos(): void {
    if (this.diagnosticos_solicitados) return;

    this.diagnosticos_solicitados = true;
    this.cargandoDiagnosticos.set(true);
    this.diagnosticoService
      .obtener_diagnosticos(this.atencionId)
      .pipe(finalize(() => this.cargandoDiagnosticos.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.diagnosticos.set(data.diagnosticos);
          this.tipos_diagnostico.set(data.tipos);
          this.clasificaciones_diagnostico.set(data.clasificaciones ?? []);
        },
        error: (error: { message?: string }) => {
          this.diagnosticos_solicitados = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar los diagnósticos.',
          );
        },
      });
  }

  buscar_diagnosticos(termino: string): void {
    if (termino.trim().length < 2) {
      this.resultados_diagnostico.set([]);
      this.buscandoDiagnostico.set(false);
      return;
    }

    this.buscandoDiagnostico.set(true);
    this.diagnosticoService
      .buscar_diagnosticos(termino.trim())
      .pipe(finalize(() => this.buscandoDiagnostico.set(false)))
      .subscribe({
        next: ({ data }) => this.resultados_diagnostico.set(data),
        error: (error: { message?: string }) => {
          this.resultados_diagnostico.set([]);
          this.utilService.mostrar_error(error.message ?? 'No se pudo buscar el diagnóstico.');
        },
      });
  }

  private cargar_apoyos_diagnosticos(): void {
    if (this.apoyos_diagnosticos_solicitados) return;

    this.apoyos_diagnosticos_solicitados = true;
    this.cargandoApoyosDiagnosticos.set(true);
    this.imagenService
      .obtener_apoyos_diagnosticos(this.atencionId)
      .pipe(finalize(() => this.cargandoApoyosDiagnosticos.set(false)))
      .subscribe({
        next: ({ data }) => this.actualizar_apoyos_diagnosticos(data),
        error: (error: { message?: string }) => {
          this.apoyos_diagnosticos_solicitados = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las solicitudes de apoyo diagnóstico.',
          );
        },
      });
  }

  private actualizar_apoyos_diagnosticos(data: ApoyoDiagnosticoContexto): void {
    this.ordenes_imagen.set(data.ordenes);
    this.prioridades_orden.set(data.prioridades);
  }

  private cargar_interconsultas(): void {
    if (this.interconsultas_solicitadas) return;

    this.interconsultas_solicitadas = true;
    this.cargandoInterconsultas.set(true);
    this.interconsultaService
      .obtener_interconsultas(this.atencionId)
      .pipe(finalize(() => this.cargandoInterconsultas.set(false)))
      .subscribe({
        next: ({ data }) => this.actualizar_interconsultas(data),
        error: (error: { message?: string }) => {
          this.interconsultas_solicitadas = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las interconsultas.',
          );
        },
      });
  }

  private actualizar_interconsultas(data: InterconsultaContexto): void {
    this.ordenes_interconsulta.set(data.ordenes);
    this.areas_interconsulta.set(data.areas);
    this.especialidades_interconsulta.set(data.especialidades);
    this.personal_interconsulta.set(data.personal);
    this.prioridades_orden.set(data.prioridades);
  }

  private cargar_laboratorio(): void {
    if (this.laboratorio_solicitado) return;

    this.laboratorio_solicitado = true;
    this.cargandoLaboratorio.set(true);
    this.laboratorioService
      .obtener_laboratorio(this.atencionId)
      .pipe(finalize(() => this.cargandoLaboratorio.set(false)))
      .subscribe({
        next: ({ data }) => this.actualizar_laboratorio(data),
        error: (error: { message?: string }) => {
          this.laboratorio_solicitado = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las solicitudes de laboratorio.',
          );
        },
      });
  }

  private actualizar_laboratorio(data: LaboratorioContexto): void {
    this.ordenes_laboratorio.set(data.ordenes);
    this.catalogo_laboratorio.set(data.catalogo);
    this.prioridades_orden.set(data.prioridades);
  }

  cargar_historial_laboratorio(): void {
    if (this.historial_laboratorio_solicitado) return;

    this.historial_laboratorio_solicitado = true;
    this.cargandoHistorialLaboratorio.set(true);
    this.laboratorioService
      .obtener_historial_laboratorio(this.atencionId)
      .pipe(finalize(() => this.cargandoHistorialLaboratorio.set(false)))
      .subscribe({
        next: ({ data }) => this.historial_laboratorio.set(data.ordenes),
        error: (error: { message?: string }) => {
          this.historial_laboratorio_solicitado = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el historial de laboratorio.',
          );
        },
      });
  }

  cargar_resultados_laboratorio(): void {
    if (this.resultados_laboratorio_solicitado) return;

    this.resultados_laboratorio_solicitado = true;
    this.cargandoResultadosLaboratorio.set(true);
    this.laboratorioService
      .obtener_resultados_laboratorio(this.atencionId)
      .pipe(finalize(() => this.cargandoResultadosLaboratorio.set(false)))
      .subscribe({
        next: ({ data }) => this.resultados_laboratorio.set(data.ordenes),
        error: (error: { message?: string }) => {
          this.resultados_laboratorio_solicitado = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar los resultados de laboratorio.',
          );
        },
      });
  }

  async guardar_laboratorio(evento: {
    prioridad_id: number;
    diagnostico_id: number;
    servicios: string[];
  }): Promise<void> {
    if (this.guardandoLaboratorio()) return;

    const confirmado = await this.utilService.confirmar_accion({
      title: '¿Registrar orden de laboratorio?',
      text: 'Se enviará la solicitud de exámenes de laboratorio seleccionados.',
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
    });
    if (!confirmado) return;

    this.guardandoLaboratorio.set(true);
    this.laboratorioService
      .guardar_laboratorio(
        this.atencionId,
        evento.prioridad_id,
        evento.diagnostico_id,
        evento.servicios,
        true,
      )
      .pipe(finalize(() => this.guardandoLaboratorio.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_laboratorio(data);
          this.utilService.mostrar_alerta(
            'Solicitud de laboratorio registrada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar la solicitud de laboratorio.',
          ),
      });
  }

  guardar_interconsulta(evento: {
    prioridad_id: number;
    diagnostico_id: number;
    especialidad_id: number;
    area_id: number;
    programacion_personal_id: number;
    que_solicita: string;
    observaciones: string;
  }): void {
    if (this.guardandoInterconsulta()) return;

    this.guardandoInterconsulta.set(true);
    this.interconsultaService
      .guardar_interconsulta(
        this.atencionId,
        evento.prioridad_id,
        evento.diagnostico_id,
        evento.especialidad_id,
        evento.area_id,
        evento.programacion_personal_id,
        evento.que_solicita,
        evento.observaciones,
        true,
      )
      .pipe(finalize(() => this.guardandoInterconsulta.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_interconsultas(data);
          this.utilService.mostrar_alerta('Interconsulta registrada correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo registrar la interconsulta.'),
      });
  }

  async eliminar_interconsulta(interconsulta_id: number): Promise<void> {
    if (this.guardandoInterconsulta()) return;

    const confirmado = await this.utilService.confirmar_eliminacion({
      title: '¿Eliminar solicitud de interconsulta?',
      text: 'Se eliminará la interconsulta seleccionada de la atención médica.',
    });
    if (!confirmado) return;

    this.guardandoInterconsulta.set(true);
    this.interconsultaService
      .eliminar_interconsulta(this.atencionId, interconsulta_id, true)
      .pipe(finalize(() => this.guardandoInterconsulta.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_interconsultas(data);
          this.utilService.mostrar_alerta('Interconsulta eliminada correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo eliminar la interconsulta.'),
      });
  }

  async eliminar_laboratorio(laboratorio_id: number): Promise<void> {
    if (this.guardandoLaboratorio()) return;

    const confirmado = await this.utilService.confirmar_eliminacion({
      title: '¿Eliminar orden de laboratorio?',
      text: 'Se eliminará la solicitud de laboratorio de la atención médica.',
    });
    if (!confirmado) return;

    this.guardandoLaboratorio.set(true);
    this.laboratorioService
      .eliminar_laboratorio(this.atencionId, laboratorio_id, true)
      .pipe(finalize(() => this.guardandoLaboratorio.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_laboratorio(data);
          this.utilService.mostrar_alerta(
            'Solicitud de laboratorio eliminada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo eliminar la solicitud de laboratorio.',
          ),
      });
  }

  private cargar_proced_enf(): void {
    if (this.proced_enf_solicitado) return;

    this.proced_enf_solicitado = true;
    this.cargandoProcedEnf.set(true);
    this.procedimientoEnfermeriaService
      .obtener_procedimientos_enfermeria(this.atencionId)
      .pipe(finalize(() => this.cargandoProcedEnf.set(false)))
      .subscribe({
        next: ({ data }) => this.actualizar_proced_enf(data),
        error: (error: { message?: string }) => {
          this.proced_enf_solicitado = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las actividades de enfermería.',
          );
        },
      });
  }

  private actualizar_proced_enf(data: ProcedEnfContexto): void {
    this.ordenes_proced_enf.set(data.ordenes);
    this.catalogo_proced_enf.set(data.catalogo);
    this.prioridades_orden.set(data.prioridades);
  }

  guardar_procedimiento_enfermeria(evento: {
    prioridad_id: number;
    servicios: Array<{ codigo: string; indicaciones?: string | null }>;
  }): void {
    if (this.guardandoProcedEnf()) return;

    this.guardandoProcedEnf.set(true);
    this.procedimientoEnfermeriaService
      .guardar_procedimiento_enfermeria(
        this.atencionId,
        evento.prioridad_id,
        evento.servicios,
        true,
      )
      .pipe(finalize(() => this.guardandoProcedEnf.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_proced_enf(data);
          this.utilService.mostrar_alerta(
            'Actividad de enfermería registrada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar la actividad de enfermería.',
          ),
      });
  }

  async eliminar_procedimiento_enfermeria(procedimiento_id: number): Promise<void> {
    if (this.guardandoProcedEnf()) return;

    const confirmado = await this.utilService.confirmar_eliminacion({
      title: '¿Eliminar actividad de enfermería?',
      text: 'Se eliminará la orden de procedimiento seleccionada.',
    });
    if (!confirmado) return;

    this.guardandoProcedEnf.set(true);
    this.procedimientoEnfermeriaService
      .eliminar_procedimiento_enfermeria(this.atencionId, procedimiento_id, true)
      .pipe(finalize(() => this.guardandoProcedEnf.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_proced_enf(data);
          this.utilService.mostrar_alerta(
            'Actividad de enfermería eliminada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo eliminar la actividad de enfermería.',
          ),
      });
  }

  private cargar_hospitalizacion(): void {
    if (this.hospitalizacion_solicitada) return;

    this.hospitalizacion_solicitada = true;
    this.cargandoHospitalizacion.set(true);
    this.hospitalizacionService
      .obtener_hospitalizacion(this.atencionId)
      .pipe(finalize(() => this.cargandoHospitalizacion.set(false)))
      .subscribe({
        next: ({ data }) => this.actualizar_hospitalizacion(data),
        error: (error: { message?: string }) => {
          this.hospitalizacion_solicitada = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar las órdenes de hospitalización.',
          );
        },
      });
  }

  private actualizar_hospitalizacion(data: HospitalizacionContexto): void {
    this.ordenes_hospitalizacion.set(data.ordenes);
    this.motivos_hospitalizacion.set(data.motivos);
  }

  guardar_hospitalizacion(evento: {
    diagnostico_id: number;
    motivo_id: number;
    observacion: string;
  }): void {
    if (this.guardandoHospitalizacion()) return;

    this.guardandoHospitalizacion.set(true);
    this.hospitalizacionService
      .guardar_hospitalizacion(
        this.atencionId,
        evento.diagnostico_id,
        evento.motivo_id,
        evento.observacion,
        true,
      )
      .pipe(finalize(() => this.guardandoHospitalizacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_hospitalizacion(data);
          this.utilService.mostrar_alerta(
            'Orden de hospitalización registrada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar la orden de hospitalización.',
          ),
      });
  }

  async eliminar_hospitalizacion(orden_hospitalizacion_id: number): Promise<void> {
    if (this.guardandoHospitalizacion()) return;

    const confirmado = await this.utilService.confirmar_eliminacion({
      title: '¿Eliminar orden de hospitalización?',
      text: 'Se eliminará la orden de hospitalización seleccionada.',
    });
    if (!confirmado) return;

    this.guardandoHospitalizacion.set(true);
    this.hospitalizacionService
      .eliminar_hospitalizacion(this.atencionId, orden_hospitalizacion_id, true)
      .pipe(finalize(() => this.guardandoHospitalizacion.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_hospitalizacion(data);
          this.utilService.mostrar_alerta(
            'Orden de hospitalización eliminada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo eliminar la orden de hospitalización.',
          ),
      });
  }

  private cargar_signos_vitales(): void {
    if (this.signos_vitales_solicitados) return;

    this.signos_vitales_solicitados = true;
    this.cargandoSignosVitales.set(true);
    this.signosVitalesService
      .obtener_signos_vitales(this.atencionId)
      .pipe(finalize(() => this.cargandoSignosVitales.set(false)))
      .subscribe({
        next: ({ data }) => this.signos_vitales.set(data),
        error: (error: { message?: string }) => {
          this.signos_vitales_solicitados = false;
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el historial de signos vitales.',
          );
        },
      });
  }

  private cargar_alergias_inicial(): void {
    this.alergiaService.obtener_alergias(this.atencionId).subscribe({
      next: ({ data }) => {
        this.alergias.set(data?.alergias ?? []);
      },
      error: () => {},
    });
  }

  guardar_signos_vitales(evento: {
    detalles: TriajeDetalleRequest[];
    observaciones: string | null;
  }): void {
    if (this.guardandoSignosVitales()) return;

    this.errorGuardadoSignosVitales.set(null);
    this.guardandoSignosVitales.set(true);
    this.signosVitalesService
      .guardar_signos_vitales(this.atencionId, evento.detalles, evento.observaciones, true)
      .pipe(finalize(() => this.guardandoSignosVitales.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.signos_vitales.set(data);
          this.utilService.mostrar_alerta('Signos vitales registrados correctamente.', 'success');
        },
        error: (error: { message?: string }) => {
          const mensaje = error.message ?? 'No se pudieron registrar los signos vitales.';
          this.errorGuardadoSignosVitales.set(mensaje);
          this.utilService.mostrar_error(mensaje);
        },
      });
  }

  actualizar_signos_vitales(evento: {
    control_vital_id: number;
    detalles: TriajeDetalleRequest[];
    observaciones: string | null;
  }): void {
    if (this.guardandoSignosVitales()) return;

    this.errorGuardadoSignosVitales.set(null);
    this.guardandoSignosVitales.set(true);
    this.signosVitalesService
      .actualizar_signos_vitales(
        this.atencionId,
        evento.control_vital_id,
        evento.detalles,
        evento.observaciones,
        true,
      )
      .pipe(finalize(() => this.guardandoSignosVitales.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.signos_vitales.set(data);
          this.utilService.mostrar_alerta('Signos vitales actualizados correctamente.', 'success');
        },
        error: (error: { message?: string }) => {
          const mensaje = error.message ?? 'No se pudieron actualizar los signos vitales.';
          this.errorGuardadoSignosVitales.set(mensaje);
          this.utilService.mostrar_error(mensaje);
        },
      });
  }

  eliminar_signos_vitales(control: ControlVitalHistorial): void {
    if (this.guardandoSignosVitales()) return;

    this.guardandoSignosVitales.set(true);
    this.signosVitalesService
      .anular_signos_vitales(this.atencionId, control.id_control_vital, null, true)
      .pipe(finalize(() => this.guardandoSignosVitales.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.signos_vitales.set(data);
          this.utilService.mostrar_alerta('Control de signos vitales anulado correctamente.', 'success');
        },
        error: (error: { message?: string }) => {
          this.utilService.mostrar_error(error.message ?? 'No se pudo anular el control de signos vitales.');
        },
      });
  }

  buscar_servicios_imagen(termino: string): void {
    if (termino.trim().length < 2) {
      this.resultados_servicio_imagen.set([]);
      this.buscandoServicioImagen.set(false);
      return;
    }

    this.buscandoServicioImagen.set(true);
    this.imagenService
      .buscar_servicios_imagen(termino.trim())
      .pipe(finalize(() => this.buscandoServicioImagen.set(false)))
      .subscribe({
        next: ({ data }) => this.resultados_servicio_imagen.set(data),
        error: (error: { message?: string }) => {
          this.resultados_servicio_imagen.set([]);
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron buscar los servicios de imágenes.',
          );
        },
      });
  }

  guardar_apoyo_imagen(evento: {
    prioridad_id: number;
    diagnostico_id: number;
    servicio_codigo: string;
    requiere_contraste: boolean;
    datos_clinicos: string;
    observacion: string;
  }): void {
    if (this.guardandoApoyoDiagnostico()) return;

    this.guardandoApoyoDiagnostico.set(true);
    this.imagenService
      .guardar_apoyo_imagen(
        this.atencionId,
        evento.prioridad_id,
        evento.diagnostico_id,
        evento.servicio_codigo,
        evento.requiere_contraste,
        evento.datos_clinicos,
        evento.observacion,
        true,
      )
      .pipe(finalize(() => this.guardandoApoyoDiagnostico.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.actualizar_apoyos_diagnosticos(data);
          this.resultados_servicio_imagen.set([]);
          this.utilService.mostrar_alerta(
            'Solicitud de imágenes registrada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar la solicitud de imágenes.',
          ),
      });
  }

  guardar_diagnostico(
    lista: Array<{
      cie10_id: number;
      tipo_id: number;
      clasificacion_id: number;
      observacion: string;
    }>,
  ): void {
    if (this.guardandoDiagnostico() || !lista || lista.length === 0) return;

    const inicio_guardado = performance.now();
    this.guardandoDiagnostico.set(true);

    let guardados = 0;
    const total = lista.length;

    const procesarSiguiente = (index: number) => {
      if (index >= total) {
        this.finalizar_guardado_diagnostico(inicio_guardado);
        this.utilService.mostrar_alerta(
          `${total} diagnóstico(s) registrado(s) correctamente.`,
          'success',
        );
        return;
      }

      const item = lista[index];
      this.diagnosticoService
        .guardar_diagnostico(
          this.atencionId,
          item.cie10_id,
          item.tipo_id,
          item.clasificacion_id,
          item.observacion,
          index === 0,
        )
        .subscribe({
          next: ({ data }) => {
            this.diagnosticos.set(data.diagnosticos);
            this.tipos_diagnostico.set(data.tipos);
            this.clasificaciones_diagnostico.set(data.clasificaciones ?? []);
            this.resultados_diagnostico.set([]);
            procesarSiguiente(index + 1);
          },
          error: (error: { message?: string }) => {
            this.finalizar_guardado_diagnostico(inicio_guardado);
            this.utilService.mostrar_error(
              error.message ?? `Error al registrar el diagnóstico #${index + 1}.`,
            );
          },
        });
    };

    procesarSiguiente(0);
  }

  private finalizar_guardado_diagnostico(inicio_guardado: number): void {
    const duracion_minima = 500;
    const restante = Math.max(0, duracion_minima - (performance.now() - inicio_guardado));

    window.setTimeout(() => this.guardandoDiagnostico.set(false), restante);
  }

  async eliminar_diagnostico(diagnostico_id: number): Promise<void> {
    if (this.guardandoDiagnostico()) return;

    const confirmado = await this.utilService.confirmar_eliminacion({
      title: '¿Eliminar diagnóstico?',
      text: '¿Está seguro de eliminar este diagnóstico de la atención médica?',
    });
    if (!confirmado) return;

    this.guardandoDiagnostico.set(true);
    this.diagnosticoService
      .eliminar_diagnostico(this.atencionId, diagnostico_id, true)
      .pipe(finalize(() => this.guardandoDiagnostico.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.diagnosticos.set(data.diagnosticos);
          this.tipos_diagnostico.set(data.tipos);
          this.clasificaciones_diagnostico.set(data.clasificaciones ?? []);
          this.utilService.mostrar_alerta('Diagnóstico eliminado correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo eliminar el diagnóstico.'),
      });
  }

  actualizar_tipo_regional(tipo: 1 | 2): void {
    this.evaluacion_form.update((actual) => ({ ...actual, tipo_reg_evaluac: tipo }));
  }

  private formularioInicial(): EvaluacionMedicaData {
    return {
      tiempo_enfermedad: '',
      motivo_consulta: '',
      anamnesis: '',
      examen_regional: '',
      signos_y_sintomas: '',
      relato: '',
      plan_tratamiento: '',
      tipo_reg_evaluac: 1,
    };
  }

  async ejecutar_guardar_alta(evento: GuardarAltaEvent): Promise<void> {
    const atencionId = this.atencionId;
    if (!atencionId || this.guardandoAlta()) return;

    const confirmado = await this.utilService.confirmar_accion({
      title: '¿Confirmar Alta Médica?',
      text: 'Se procederá con el cierre de la atención médica y el egreso del paciente. Esta acción no se puede deshacer.',
      icon: 'question',
      confirmButtonText: 'Sí, confirmar alta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
    });

    if (!confirmado) return;

    this.guardandoAlta.set(true);

    this.altaPacienteService
      .registrar(atencionId, {
        tipo_alta_id: evento.tipo_alta_id,
        egreso_id: evento.egreso_id,
        condi_alta_id: evento.condi_alta_id,
        resumen_egreso: evento.resumen_egreso,
        observaciones: evento.observaciones,
        ind_act_fisica: evento.actividad_fisica,
        descanso_medico: evento.descanso_medico,
      })
      .pipe(finalize(() => this.guardandoAlta.set(false)))
      .subscribe({
        next: () => {
          this.modalAlta()?.close();
          this.utilService.mostrar_alerta('Alta médica registrada correctamente.', 'success');

          this.cargar_atencion();
        },
        error: (error: { message?: string }) => {
          this.utilService.mostrar_error(error.message ?? 'No se pudo cerrar la atención médica.');
        },
      });
  }

  ver_pdf_descanso_medico(descansoId?: number): void {
    const atencionId = this.atencionId;
    if (!atencionId) return;

    this.descansoMedicoService.descargar_pdf_descanso(atencionId, descansoId, true).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(
          error.message ?? 'No se pudo generar el Certificado de Descanso Médico.',
        );
      },
    });
  }

  async abrir_finalizacion(): Promise<void> {
    try {
        const { data } = await firstValueFrom(
        this.diagnosticoService.obtener_diagnosticos(this.atencionId, true),
      );
      this.diagnosticos.set(data.diagnosticos);
      this.tipos_diagnostico.set(data.tipos);
      this.clasificaciones_diagnostico.set(data.clasificaciones ?? []);
    } catch (error: any) {
      this.utilService.mostrar_error(
        error?.message ?? 'No se pudieron consultar los diagnósticos de la atención.',
      );
      return;
    }

    const form = this.evaluacion_form();
    const tieneEnfermedad = Boolean(
      form.tiempo_enfermedad?.trim() && form.motivo_consulta?.trim() && form.anamnesis?.trim(),
    );
    const tieneDiagnosticos = this.diagnosticos().length > 0;

    if (!tieneEnfermedad || !tieneDiagnosticos) {
      const pendientes: string[] = [];
      if (!tieneEnfermedad) pendientes.push('Enfermedad Actual (tiempo, motivo y síntomas)');
      if (!tieneDiagnosticos) pendientes.push('Al menos un Diagnóstico CIE-10');

      void this.utilService.mostrar_aviso({
        title: 'Atención incompleta',
        html: `Para finalizar la atención debe completar y guardar:<br><ul style="text-align:left;margin-top:10px;">${pendientes.map((p) => `<li>${p}</li>`).join('')}</ul>`,
        icon: 'warning',
      });
      return;
    }

    if (this.es_caso_agresion() && !this.tiene_hoja_lesiones()) {
      const confirmacion = await this.utilService.confirmar_accion({
        title: 'Hoja de lesiones pendiente',
        text: 'El paciente ingresó por motivo de agresión y aún no se ha registrado la Hoja de Registro de Lesiones médico-legal. ¿Desea registrarla antes de finalizar la atención?',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fa-solid fa-user-injured me-1"></i> Llenar hoja de lesiones',
        cancelButtonText: 'Omitir y continuar finalización',
        reverseButtons: true,
      });

      if (confirmacion) {
        this.abrir_hoja_lesiones();
        return;
      }
    }

    const atencionId = this.atencionId;
    if (!atencionId) return;

    this.cierreAtencionService.obtener_cierre_atencion(atencionId, true).subscribe({
      next: ({ data }) => {
        if (!data.puede_cerrar) {
          const listaMotivos = (data.motivos ?? []).map((m: string) => `<li>${m}</li>`).join('');
          void this.utilService.mostrar_aviso({
            title: 'Atención incompleta',
            html: `Para finalizar la atención debe subsanar:<br><ul style="text-align:left;margin-top:10px;">${listaMotivos}</ul>`,
            icon: 'warning',
          });
          return;
        }

        this.destinos_cierre.set(data.destinos ?? []);
        this.paso_finalizacion.set('alta');
        this.modalAlta()?.open();
      },
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(error.message ?? 'No se pudieron consultar los requisitos de cierre.');
      },
    });
  }

  continuar_finalizacion(): void {
    const destino = this.destino_finalizacion();
    if (!destino) return;

    this.modalDestino()?.close();
    this.paso_finalizacion.set('alta');
    setTimeout(() => this.modalAlta()?.open(), 150);
  }

  volver_a_cola(): Promise<boolean> {
    return this.router.navigate(['/emergencia/atencion-medica']);
  }
}

const DETALLE_ATENCION_INICIAL: DetalleAtencionResponse = {
  atencion_id: 0,
  programacion_personal_id: null,
  codigo_episodio: 'Cargando atención',
  fecha_hora_ingreso: '',
  fecha_hora_llamada_med: null,
  fecha_hora_egr: null,
  estado_codigo: null,
  estado_nombre: 'Consultando información',
  estado_seguimiento: 'TRIADO',
  triaje_registrado: true,
  motivo_ingreso_id: null,
  motivo_ingreso: null,
  motivo_consulta: null,
  paciente: {
    paciente_id: 0,
    tipo_documento_id: null,
    tipo_documento: null,
    numero_documento: null,
    numero_historia: null,
    nombre_completo: 'Consultando paciente...',
    sexo_codigo: null,
    sexo: null,
    edad: null,
    grado_id: null,
    grado: null,
    grado_codigo: null,
    codigo_afiliado: null,
    nsa: null,
    celular: null,
    correo_electronico: null,
    situacion: null,
    parentesco: null,
    es_nn: false,
  },
  atencion: {
    tipo_paciente_id: 0,
    especialidad_id: 0,
    procedencia_id: 0,
    numero_historia: null,
  },
};
