import {
  RegistrarTriajeRequest,
  RegistroTriajeFormValue,
  TriajeDetalleRequest,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { CODIGOS_PARAMETRO_CLINICO, CODIGOS_PRIORIDAD } from '../domain/triaje.constants';

export interface ContextoMapeoTriaje {
  atencionId: number;
  esPacienteNn: boolean;
  esConsultorioEmergencia: boolean;
  destinoTraumaShockId: number | null;
  codigosParametrosDisponibles: Set<string>;
}

export class TriajePayloadMapper {
  static aRequest(
    model: RegistroTriajeFormValue,
    contexto: ContextoMapeoTriaje,
  ): { request: RegistrarTriajeRequest | null; error?: string } {
    const { detalles, error } = this.construirDetalles(
      model,
      contexto.codigosParametrosDisponibles,
    );

    if (error || !detalles) {
      return { request: null, error: error ?? 'Error al procesar los signos vitales.' };
    }

    const destinoAreaFinal =
      contexto.esPacienteNn && contexto.destinoTraumaShockId
        ? contexto.destinoTraumaShockId
        : model.destinoAreaId!;

    const especialidadFinal =
      !contexto.esPacienteNn && contexto.esConsultorioEmergencia
        ? model.destinoEspecialidadId
        : null;

    const prioridadFinal = contexto.esPacienteNn
      ? CODIGOS_PRIORIDAD.I
      : model.prioridad;

    const request: RegistrarTriajeRequest = {
      atencion_id: contexto.atencionId,
      triaje: {
        condicion_llegada_id: model.condicionLlegada!,
        motivo_ingreso_id: model.motivoIngreso!,
        nivel_triaje_codigo: prioridadFinal,
        motivo_consulta: model.motivoConsulta.trim(),
        destino_area_id: destinoAreaFinal,
        destino_especialidad_id: especialidadFinal,
        programacion_personal_id: model.programacionPersonalId
          ? Number(model.programacionPersonalId)
          : null,
        observacion: model.observaciones.trim() || null,
      },
      control_vital: {
        observaciones: null,
        detalles,
      },
    };

    return { request };
  }

  static construirDetalles(
    model: RegistroTriajeFormValue,
    disponibles: Set<string>,
  ): { detalles: TriajeDetalleRequest[] | null; error?: string } {
    const detalles: TriajeDetalleRequest[] = [];
    let parametroNoDisponible: string | null = null;

    const agregar = (codigo: string, raw: string | number | null | undefined, componente: string | null = null): void => {
      if (raw === null || raw === undefined) return;
      const texto = String(raw).trim();
      if (texto === '') return;

      if (!disponibles.has(codigo)) {
        parametroNoDisponible ??= codigo;
        return;
      }

      detalles.push({
        parametro_codigo: codigo,
        componente_codigo: componente,
        valor: Number(texto.replace(',', '.')),
      });
    };

    agregar(CODIGOS_PARAMETRO_CLINICO.TEMP, model.temperatura);
    agregar(CODIGOS_PARAMETRO_CLINICO.FC, model.fc);
    agregar(CODIGOS_PARAMETRO_CLINICO.FR, model.fr);
    agregar(CODIGOS_PARAMETRO_CLINICO.SATO2, model.saturacion);
    agregar(CODIGOS_PARAMETRO_CLINICO.PESO, model.peso);
    agregar(CODIGOS_PARAMETRO_CLINICO.TALLA, model.talla);
    agregar(CODIGOS_PARAMETRO_CLINICO.EVA, model.eva);

    const sistolica = model.paSistolica;
    const diastolica = model.paDiastolica;
    if (sistolica || diastolica) {
      if (!sistolica || !diastolica) {
        return { detalles: null, error: 'Ingrese las presiones sistólica y diastólica.' };
      }
      agregar(CODIGOS_PARAMETRO_CLINICO.PA, sistolica, CODIGOS_PARAMETRO_CLINICO.PAS);
      agregar(CODIGOS_PARAMETRO_CLINICO.PA, diastolica, CODIGOS_PARAMETRO_CLINICO.PAD);
    }

    if (parametroNoDisponible) {
      return {
        detalles: null,
        error: `El parámetro clínico ${parametroNoDisponible} no está disponible.`,
      };
    }

    return { detalles };
  }
}
