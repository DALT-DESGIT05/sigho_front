import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CheckToggleComponent } from '../../../../../components/check-toggle/check-toggle.component';
import { CheckComponent } from '../../../../../components/check/check.component';
import { InputDateComponent } from '../../../../../components/input-date/input-date.component';
import { InputTextComponent } from '../../../../../components/input-text/input-text.component';
import { RadioComponent } from '../../../../../components/radio/radio.component';
import {
  SelectComponent,
  SelectOption,
  SelectValue,
} from '../../../../../components/select/select.component';
import { TextAreaComponent } from '../../../../../components/text-area/text-area.component';
import {
  DescansoMedicoRegistro,
  ExcepcionDescansoMedico,
  RegistrarDescansoMedicoRequest,
  TipoDescansoMedico,
} from '../../../../../interfaces/emergencia/descanso-medico.interface';
import {
  DetalleAtencionResponse,
  Diagnostico,
  EvaluacionMedicaData,
} from '../../../../../interfaces/emergencia/triaje.interface';
import {
  CondicionAlta,
  DestinoEgreso,
  TipoAlta,
} from '../../../../../interfaces/hospitalizacion/alta-paciente.interface';
import { DateService } from '../../../../../services/date.service';
import { AltaPacienteService } from '../../../../../services/hospitalizacion/alta-paciente.service';
import { DescansoMedicoService } from '../../../../../services/emergencia/descanso-medico.service';
import { UtilService } from '../../../../../services/util.service';
import { formatear_nombre_medico } from '../../../utils/nombre-medico.util';

export interface GuardarAltaEvent {
  tipo_alta_id: number;
  egreso_id: number;
  condi_alta_id: number;
  descanso_medico: RegistrarDescansoMedicoRequest | null;
  resumen_egreso: string;
  observaciones: string;
  actividad_fisica: 'SI' | 'NO' | null;
}

@Component({
  selector: 'app-alta-paciente',
  standalone: true,
  imports: [
    ButtonComponent,
    CheckToggleComponent,
    CheckComponent,
    InputDateComponent,
    InputTextComponent,
    RadioComponent,
    SelectComponent,
    TextAreaComponent,
  ],
  templateUrl: './alta-paciente.component.html',
  styleUrl: './alta-paciente.component.scss',
})
export class AltaPacienteComponent implements OnInit {
  private readonly descansoMedicoService = inject(DescansoMedicoService);
  private readonly altaPacienteService = inject(AltaPacienteService);
  private readonly dateService = inject(DateService);
  private readonly utilService = inject(UtilService);

  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly formulario = input.required<EvaluacionMedicaData>();
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly destinoCodigo = input<string>('EGR');
  readonly guardando = input<boolean>(false);

  readonly guardar_alta = output<GuardarAltaEvent>();
  readonly ver_pdf_descanso = output<number>();
  readonly cerrar = output<void>();

  actividad_fisica: 'SI' | 'NO' | null = null;
  resumen_egreso = '';
  observaciones = '';


  readonly cargandoDescanso = signal<boolean>(false);
  readonly catalogoDescansoCargado = signal<boolean>(false);
  readonly tiposDescanso = signal<TipoDescansoMedico[]>([]);
  readonly excepcionesDisponibles = signal<ExcepcionDescansoMedico[]>([]);
  readonly descansoExistente = signal<DescansoMedicoRegistro | null>(null);

  readonly requiereDescansoMedico = signal<boolean>(false);
  readonly indicadorDescanso = signal<1 | 2>(1);
  tipoDescansoId: SelectValue = null;
  readonly fechaInicioDescanso = signal<string | null>(
    DateTime.now().setZone(this.dateService.defaultZone).toISODate(),
  );
  readonly fechaFinDescanso = signal<string | null>(
    DateTime.now().setZone(this.dateService.defaultZone).toISODate(),
  );
  descripcionClinicaDescanso = '';
  readonly excepcionesSeleccionadas = signal<Set<number>>(new Set());
  readonly tiposAlta = signal<TipoAlta[]>([]);
  readonly destinosEgreso = signal<DestinoEgreso[]>([]);
  readonly condicionesAlta = signal<CondicionAlta[]>([]);
  readonly tiposAltaOptions = computed<SelectOption[]>(() => this.tiposAlta().map((item) => ({ value: item.id_tipo_alta, label: item.nomb_tip_alta })));
  readonly destinosEgresoOptions = computed<SelectOption[]>(() => this.destinosEgreso().map((item) => ({ value: item.id_egreso, label: item.nomb_egreso })));
  readonly condicionesAltaOptions = computed<SelectOption[]>(() => this.condicionesAlta().map((item) => ({ value: item.id_condi_alta, label: item.nomb_condi_alta })));
  tipoAltaId: SelectValue = null;
  egresoId: SelectValue = null;
  condiAltaId: SelectValue = null;

  readonly esPersonalMilitarActividad = computed<boolean>(() => {
    const pac = this.detalle().paciente;
    if (!pac) return false;
    const paren = (pac.codigo_parentesco || pac.parentesco || '').trim().toUpperCase();
    const esTitular = !paren || paren === 'A' || paren === 'TITULAR' || paren === 'T';
    const situ = (pac.situacion || '').trim().toUpperCase();
    const esActividad = situ === 'ACTIVIDAD' || pac.es_afiliado === true;
    const esMilitar = Boolean(pac.nsa || pac.grado || pac.grado_codigo);
    return esTitular && esActividad && esMilitar;
  });

  readonly fechaIngresoAtencion = computed(() => {
    const fechaHora = this.detalle().fecha_hora_ingreso;
    if (!fechaHora) return '';
    return fechaHora.split(' ')[0] ?? '';
  });

  readonly tiposDescansoOptions = computed<SelectOption[]>(() =>
    this.tiposDescanso().map((tipo) => ({
      value: tipo.tipo_id,
      label: tipo.nombre,
    })),
  );

  readonly totalDiasDescanso = computed<number>(() => {
    const inicio = this.fechaInicioDescanso();
    const fin = this.fechaFinDescanso();
    if (!inicio || !fin) return 0;

    const dtInicio = this.dateService.parse(inicio);
    const dtFin = this.dateService.parse(fin);
    if (!dtInicio || !dtFin) return 0;

    const diff = dtFin.diff(dtInicio, 'days').days;
    return diff >= 0 ? Math.floor(diff) + 1 : 0;
  });

  readonly duracionDescansoTexto = computed<string>(() => {
    const dias = this.totalDiasDescanso();
    return dias > 0 ? `${dias} ${dias === 1 ? 'día' : 'días'}` : '0 días';
  });

  readonly pacienteNombreFormateado = computed<string>(() => {
    const pac = this.detalle().paciente;
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

  readonly pacienteDatosResumen = computed<string>(() => {
    const pac = this.detalle().paciente;
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

  readonly medicoTratanteNombre = computed<string>(() => {
    const med = this.detalle().medico_tratante;
    if (med?.nombre_completo) {
      const cmp = med.cmp ? ` (CMP: ${med.cmp})` : '';
      return `${formatear_nombre_medico(med.nombre_completo)}${cmp}`;
    }
    return 'Médico tratante de Emergencia';
  });

  readonly tipoSeleccionadoRequiereDx = computed<boolean>(() => {
    const tipoId = Number(this.tipoDescansoId);
    if (!tipoId) return false;
    const tipo = this.tiposDescanso().find((t) => t.tipo_id === tipoId);
    return tipo ? tipo.requiere_diagnostico === 1 : false;
  });

  readonly diagnostico_inicial = computed(() =>
    this.formatear_diagnosticos(
      this.diagnosticos().filter((diagnostico) => diagnostico.tipo_codigo !== 'DEF'),
    ),
  );

  readonly diagnostico_final = computed(() =>
    this.formatear_diagnosticos(
      this.diagnosticos().filter((diagnostico) => diagnostico.tipo_codigo === 'DEF'),
    ),
  );

  ngOnInit(): void {
    this.cargar_catalogos_alta();
  }

  cargar_catalogos_alta(): void {
    this.altaPacienteService.catalogos(this.detalle().atencion_id).subscribe({
      next: ({ data }) => {
        this.tiposAlta.set(data.tipos_alta ?? []);
        this.destinosEgreso.set(data.destinos ?? []);
        this.condicionesAlta.set(data.condiciones ?? []);

        if (!this.tipoAltaId && data.tipos_alta?.length) {
          const defaultTipo = data.tipos_alta.find((t) => t.cod_tip_alta === 'TALT_01') ?? data.tipos_alta[0];
          this.tipoAltaId = defaultTipo.id_tipo_alta;
        }

        if (!this.egresoId && data.destinos?.length) {
          const defaultDestino = data.destinos.find((d) => d.cod_egreso === 'DOM') ?? data.destinos[0];
          this.egresoId = defaultDestino.id_egreso;
        }

        if (!this.condiAltaId && data.condiciones?.length) {
          const defaultCondicion = data.condiciones.find((c) => c.cod_condi_alta === 'MEJ') ?? data.condiciones[0];
          this.condiAltaId = defaultCondicion.id_condi_alta;
        }

        if (!this.resumen_egreso.trim()) {
          this.resumen_egreso = this.formulario().plan_tratamiento?.trim() || '';
        }
      },
    });
  }

  cargar_datos_descanso_medico(): void {
    const atencionId = this.detalle().atencion_id;
    if (!atencionId) return;

    this.cargandoDescanso.set(true);
    this.descansoMedicoService.obtener_descansos(atencionId).subscribe({
      next: ({ data }) => {
        this.tiposDescanso.set(data?.tipos ?? []);
        this.excepcionesDisponibles.set(data?.excepciones ?? []);

        const descansos = data?.descansos ?? [];
        if (descansos.length > 0) {
          this.descansoExistente.set(descansos[0]);
          this.requiereDescansoMedico.set(true);
        } else {

          if (data?.tipos && data.tipos.length > 0) {
            this.tipoDescansoId = data.tipos[0].tipo_id;
          }
        }
        this.catalogoDescansoCargado.set(true);
        this.cargandoDescanso.set(false);
      },
      error: (error: unknown) => {
        this.cargandoDescanso.set(false);
        this.utilService.mostrar_error(
          error instanceof Error ? error.message : 'No se pudieron cargar los tipos de descanso médico.',
        );
      },
    });
  }

  seleccionar_actividad_fisica(valor: 'SI' | 'NO'): void {
    this.actividad_fisica = valor;
  }

  toggle_requiere_descanso(activo: boolean): void {
    this.requiereDescansoMedico.set(activo);

    if (activo && !this.catalogoDescansoCargado() && !this.cargandoDescanso()) {
      this.cargar_datos_descanso_medico();
    }
  }

  actualizar_fecha_inicio_descanso(valor: string | Date | number | null | undefined): void {
    this.fechaInicioDescanso.set(valor == null ? null : String(valor));
  }

  actualizar_fecha_fin_descanso(valor: string | Date | number | null | undefined): void {
    this.fechaFinDescanso.set(valor == null ? null : String(valor));
  }

  seleccionar_indicador(indicador: 1 | 2): void {
    if (indicador === 2 && !this.esPersonalMilitarActividad()) {
      this.utilService.mostrar_alerta(
        'La modalidad de Excepciones de servicio (Marchas, Formaciones, Servicios y Esfuerzo Físico) aplica exclusivamente al Personal Militar en Actividad.',
        'warning',
      );
      return;
    }
    this.indicadorDescanso.set(indicador);
  }

  excepcion_marcada(id: number): boolean {
    return this.excepcionesSeleccionadas().has(id);
  }

  toggle_excepcion(id: number): void {
    if (!this.esPersonalMilitarActividad()) {
      this.utilService.mostrar_alerta(
        'Las excepciones de servicio aplican exclusivamente al Personal Militar en Actividad.',
        'warning',
      );
      return;
    }
    const actual = new Set(this.excepcionesSeleccionadas());
    if (actual.has(id)) {
      actual.delete(id);
    } else {
      actual.add(id);
    }
    this.excepcionesSeleccionadas.set(actual);
  }

  confirmar_guardar_alta(): void {
    if (this.guardando()) return;

    let descansoRequest: RegistrarDescansoMedicoRequest | null = null;

    if (this.requiereDescansoMedico() && !this.descansoExistente()) {
      if (this.indicadorDescanso() === 2 && !this.esPersonalMilitarActividad()) {
        this.utilService.mostrar_alerta(
          'Las excepciones de servicio solo aplican para personal militar en actividad.',
          'warning',
        );
        return;
      }

      if (this.indicadorDescanso() === 2 && this.excepcionesSeleccionadas().size === 0) {
        this.utilService.mostrar_alerta(
          'Debe seleccionar al menos una excepción de actividades para el personal militar.',
          'warning',
        );
        return;
      }

      if (!this.tipoDescansoId) {
        this.utilService.mostrar_alerta('Debe seleccionar el Tipo de Descanso Médico.', 'warning');
        return;
      }

      if (!this.fechaInicioDescanso || !this.fechaFinDescanso) {
        this.utilService.mostrar_alerta(
          'Debe ingresar las fechas de inicio y fin del descanso médico.',
          'warning',
        );
        return;
      }

      if (this.totalDiasDescanso() <= 0) {
        this.utilService.mostrar_alerta(
          'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
          'warning',
        );
        return;
      }

      if (this.tipoSeleccionadoRequiereDx() && this.diagnosticos().length === 0) {
        this.utilService.mostrar_alerta(
          'El tipo de descanso seleccionado requiere al menos un diagnóstico registrado en la atención.',
          'warning',
        );
        return;
      }

      descansoRequest = {
        indicador: this.indicadorDescanso(),
        tipo_id: Number(this.tipoDescansoId),
        fecha_inicio: this.fechaInicioDescanso() as string,
        fecha_fin: this.fechaFinDescanso() as string,
        descripcion_clinica: this.descripcionClinicaDescanso.trim() || null,
        excepciones: Array.from(this.excepcionesSeleccionadas()),
      };
    }

    if (!this.tipoAltaId || !this.egresoId || !this.condiAltaId) {
      this.utilService.mostrar_alerta('Debe seleccionar tipo de alta, destino y condición al alta.', 'warning');
      return;
    }

    if (!this.resumen_egreso.trim()) {
      this.utilService.mostrar_alerta(
        'Debe registrar el resumen y los criterios clínicos del egreso.',
        'warning',
      );
      return;
    }

    this.guardar_alta.emit({
      tipo_alta_id: Number(this.tipoAltaId),
      egreso_id: Number(this.egresoId),
      condi_alta_id: Number(this.condiAltaId),
      descanso_medico: descansoRequest,
      resumen_egreso: this.resumen_egreso.trim(),
      observaciones: this.observaciones.trim(),
      actividad_fisica: this.actividad_fisica,
    });
  }

  private formatear_diagnosticos(diagnosticos: readonly Diagnostico[]): string {
    if (!diagnosticos || diagnosticos.length === 0) {
      return '';
    }
    return diagnosticos
      .map((diagnostico) => `${diagnostico.codigo} - ${diagnostico.descripcion}`)
      .join('; ');
  }
}
