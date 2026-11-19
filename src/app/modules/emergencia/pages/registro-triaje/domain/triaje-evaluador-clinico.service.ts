import { Injectable, signal } from '@angular/core';
import { PaletteColor } from '../../../../../interfaces/util.interface';
import {
  CODIGOS_CONDICION_LLEGADA,
  CODIGOS_PRIORIDAD,
  NivelPrioridadTriaje,
} from './triaje.constants';
import {
  NivelAlertaClinica,
  PROTOCOLO_TRIAJE_EMERGENCIA_ADULTOS,
  ProtocoloTriajeConfig,
  ReglaSignoVital,
} from './triaje-protocolo.config';

export interface SignosVitalesInput {
  temperatura?: string | number | null;
  paSistolica?: string | number | null;
  paDiastolica?: string | number | null;
  saturacion?: string | number | null;
  fc?: string | number | null;
  fr?: string | number | null;
  eva?: string | number | null;
  condicionLlegadaCodigo?: string | null;
  esPacienteNn?: boolean;
}

export interface AlertaClinicaSigno {
  parametro: string;
  valor: string;
  mensaje: string;
}

export interface DecisionTriajeClinico {
  signos: {
    temperatura: NivelAlertaClinica;
    paSistolica: NivelAlertaClinica;
    paDiastolica: NivelAlertaClinica;
    saturacion: NivelAlertaClinica;
    fc: NivelAlertaClinica;
    fr: NivelAlertaClinica;
    eva: NivelAlertaClinica;
  };
  tieneCritico: boolean;
  tieneAlterado: boolean;
  todosNormales: boolean;
  prioridadSugerida: NivelPrioridadTriaje | null;
  prioridad1Bloqueada: boolean;
  alertasCriticas: AlertaClinicaSigno[];
}

@Injectable({
  providedIn: 'root',
})
export class TriajeEvaluadorClinicoService {
  private readonly protocoloActivo = signal<ProtocoloTriajeConfig>(
    PROTOCOLO_TRIAJE_EMERGENCIA_ADULTOS,
  );

  asignar_protocolo(protocolo: ProtocoloTriajeConfig): void {
    this.protocoloActivo.set(protocolo);
  }

  evaluar(input: SignosVitalesInput): DecisionTriajeClinico {
    const config = this.protocoloActivo();
    const alertasCriticas: AlertaClinicaSigno[] = [];

    const satNum = this.parse_numero(input.saturacion);
    const pasNum = this.parse_numero(input.paSistolica);
    const padNum = this.parse_numero(input.paDiastolica);
    const fcNum = this.parse_numero(input.fc);
    const frNum = this.parse_numero(input.fr);
    const tempNum = this.parse_numero(input.temperatura);
    const evaNum = this.parse_numero(input.eva);

    const satNivel = this.clasificar_signo(satNum, config.saturacion, (v) => {
      alertasCriticas.push({
        parametro: 'Sat. O₂',
        valor: `${v}%`,
        mensaje: config.saturacion.mensajeCritico(v),
      });
    });

    const pasNivel = this.clasificar_signo(pasNum, config.pas, (v) => {
      alertasCriticas.push({
        parametro: 'PAS',
        valor: `${v} mmHg`,
        mensaje: config.pas.mensajeCritico(v),
      });
    });

    const padNivel = this.clasificar_signo(padNum, config.pad, (v) => {
      alertasCriticas.push({
        parametro: 'PAD',
        valor: `${v} mmHg`,
        mensaje: config.pad.mensajeCritico(v),
      });
    });

    const fcNivel = this.clasificar_signo(fcNum, config.fc, (v) => {
      alertasCriticas.push({
        parametro: 'FC',
        valor: `${v} lpm`,
        mensaje: config.fc.mensajeCritico(v),
      });
    });

    const frNivel = this.clasificar_signo(frNum, config.fr, (v) => {
      alertasCriticas.push({
        parametro: 'FR',
        valor: `${v} rpm`,
        mensaje: config.fr.mensajeCritico(v),
      });
    });

    const tempNivel = this.clasificar_signo(tempNum, config.temperatura, (v) => {
      alertasCriticas.push({
        parametro: 'Temp.',
        valor: `${v.toFixed(1)} °C`,
        mensaje: config.temperatura.mensajeCritico(v),
      });
    });

    let evaNivel: NivelAlertaClinica = 'NO_INGRESADO';
    if (evaNum !== null) {
      if (config.eva.esCritico(evaNum)) {
        evaNivel = 'CRITICO';
        alertasCriticas.push({
          parametro: 'EVA',
          valor: `${evaNum}/10`,
          mensaje: 'Dolor extremo (EVA 9-10).',
        });
      } else if (config.eva.esSevero(evaNum) || config.eva.esModerado(evaNum)) {
        evaNivel = 'ALTERADO';
      } else if (config.eva.esNormal(evaNum)) {
        evaNivel = 'NORMAL';
      }
    }

    const nivelesSignos = [
      satNivel,
      pasNivel,
      padNivel,
      fcNivel,
      frNivel,
      tempNivel,
      evaNivel,
    ];

    const ingresados = nivelesSignos.filter((n) => n !== 'NO_INGRESADO');
    const tieneCritico = nivelesSignos.some((n) => n === 'CRITICO');
    const tieneAlterado = nivelesSignos.some((n) => n === 'ALTERADO');
    const todosNormales = ingresados.length > 0 && ingresados.every((n) => n === 'NORMAL');

    let prioridadSugerida: NivelPrioridadTriaje | null = null;
    if (tieneCritico || input.esPacienteNn) {
      prioridadSugerida = CODIGOS_PRIORIDAD.I;
    } else if (
      evaNum !== null &&
      config.eva.esSevero(evaNum) ||
      (satNum !== null && satNum >= 90 && satNum <= 94) ||
      (pasNum !== null && pasNum >= 160 && pasNum <= 179) ||
      (tempNum !== null && tempNum >= 39.0 && tempNivel === 'ALTERADO')
    ) {
      prioridadSugerida = CODIGOS_PRIORIDAD.II;
    } else if (
      (evaNum !== null && config.eva.esModerado(evaNum)) ||
      tieneAlterado
    ) {
      prioridadSugerida = CODIGOS_PRIORIDAD.III;
    } else if (todosNormales) {
      prioridadSugerida = CODIGOS_PRIORIDAD.IV;
    }

    const vieneCaminando =
      String(input.condicionLlegadaCodigo ?? '')
        .trim()
        .toUpperCase() === CODIGOS_CONDICION_LLEGADA.CAMINANDO;

    const prioridad1Bloqueada =
      !input.esPacienteNn &&
      !tieneCritico &&
      (todosNormales || (vieneCaminando && !tieneCritico));

    return {
      signos: {
        temperatura: tempNivel,
        paSistolica: pasNivel,
        paDiastolica: padNivel,
        saturacion: satNivel,
        fc: fcNivel,
        fr: frNivel,
        eva: evaNivel,
      },
      tieneCritico,
      tieneAlterado,
      todosNormales,
      prioridadSugerida,
      prioridad1Bloqueada,
      alertasCriticas,
    };
  }

  nivel_a_color(nivel: NivelAlertaClinica): PaletteColor {
    switch (nivel) {
      case 'CRITICO':
        return 'danger';
      case 'ALTERADO':
        return 'warning';
      case 'NORMAL':
        return 'success';
      case 'NO_INGRESADO':
      default:
        return 'secondary';
    }
  }

  calcular_imc(
    pesoRaw: string | number | null | undefined,
    tallaRaw: string | number | null | undefined,
  ): { imc: string; clasificacion: string; estado: PaletteColor } {
    const pesoLimpio = String(pesoRaw ?? '')
      .replace(',', '.')
      .trim();
    const tallaLimpia = String(tallaRaw ?? '')
      .replace(',', '.')
      .trim();

    const peso = Number(pesoLimpio);
    const talla = Number(tallaLimpia);

    if (!peso || !talla || peso < 0.5 || peso > 300) {
      return { imc: '', clasificacion: 'Sin clasificación', estado: 'secondary' };
    }

    const tallaEnMetros = talla > 3 ? talla / 100 : talla;
    if (tallaEnMetros < 0.25 || tallaEnMetros > 2.5) {
      return { imc: '', clasificacion: 'Sin clasificación', estado: 'secondary' };
    }

    const imcNum = peso / (tallaEnMetros * tallaEnMetros);
    if (!Number.isFinite(imcNum) || imcNum <= 0) {
      return { imc: '', clasificacion: 'Sin clasificación', estado: 'secondary' };
    }

    const imc = imcNum.toFixed(2);
    let clasificacion = 'Normal';
    let estado: PaletteColor = 'success';

    if (imcNum < 18.5) {
      clasificacion = 'Bajo peso';
      estado = 'warning';
    } else if (imcNum >= 25 && imcNum < 30) {
      clasificacion = 'Sobrepeso';
      estado = 'warning';
    } else if (imcNum >= 30 && imcNum < 35) {
      clasificacion = 'Obesidad I';
      estado = 'danger';
    } else if (imcNum >= 35 && imcNum < 40) {
      clasificacion = 'Obesidad II';
      estado = 'danger';
    } else if (imcNum >= 40) {
      clasificacion = 'Obesidad III (Mórbida)';
      estado = 'danger';
    }

    return { imc, clasificacion, estado };
  }

  private clasificar_signo(
    valor: number | null,
    regla: ReglaSignoVital,
    onCritico: (v: number) => void,
  ): NivelAlertaClinica {
    if (valor === null) {
      return 'NO_INGRESADO';
    }

    if (regla.esCritico(valor)) {
      onCritico(valor);
      return 'CRITICO';
    }

    if (regla.esNormal(valor)) {
      return 'NORMAL';
    }

    if (regla.esAlterado(valor)) {
      return 'ALTERADO';
    }

    return 'ALTERADO';
  }

  private parse_numero(raw: string | number | null | undefined): number | null {
    if (raw === null || raw === undefined) {
      return null;
    }

    const texto = String(raw).replace(',', '.').trim();
    if (texto === '') {
      return null;
    }

    const num = Number(texto);
    return Number.isFinite(num) ? num : null;
  }
}
