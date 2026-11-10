import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CheckComponent } from '../../../../../components/check/check.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { SelectComponent, SelectValue } from '../../../../../components/select/select.component';
import { RepSexContexto, RepSexPerfil } from '../../../../../interfaces/emergencia/triaje.interface';
import { AntRepSexService } from '../../../../../services/emergencia/ant-rep-sex.service';
import { UtilService } from '../../../../../services/util.service';

const CONTEXTO_INICIAL: RepSexContexto = {
  perfil: null,
  ciclos: [],
  orientaciones_sexuales: [],
  resultados_pap: [],
  metodos_anticonceptivos: [],
  resultados_mamografia: [],
};

const FORMULARIO_INICIAL = {
  ciclo_id: null as number | null,
  orientacion_sex_id: null as number | null,
  resul_pap_id: null as number | null,
  met_anticon_id: null as number | null,
  resul_mamograf_id: null as number | null,
  fur: '',
  dur_ciclo: '',
  dur_mes: '',
  gestas: '',
  partos: '',
  abortos: '',
  hijos_vivos: '',
  ult_par_abor: '',
  desea_embarazo: false,
  tiempo_uso_met: '',
  comentario: '',
  fecha_ult_pap: '',
  obs_ginecologica: '',
  ini_vida_sex: '',
  parejas_sex: '',
  acti_sex_actual: false,
  uso_preservativo: false,
  ets: false,
  obs_sexuales: '',
};

type Formulario = typeof FORMULARIO_INICIAL;

@Component({
  selector: 'app-antecedentes-rep-sex',
  standalone: true,
  imports: [ButtonComponent, CheckComponent, InputGroupComponent, SelectComponent],
  templateUrl: './antecedentes-rep-sex.component.html',
  styleUrl: './antecedentes-rep-sex.component.scss',
})
export class AntecedentesRepSexComponent implements OnInit {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly perfilChange = output<RepSexPerfil | null>();

  private readonly antRepSexService = inject(AntRepSexService);
  private readonly utilService = inject(UtilService);

  readonly contexto = signal<RepSexContexto>(CONTEXTO_INICIAL);
  readonly formulario = signal<Formulario>({ ...FORMULARIO_INICIAL });
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.antRepSexService
      .obtener_rep_sex(this.atencionId())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => this.establecerContexto(data),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el antecedente gineco-obstétrico y sexual.',
          ),
      });
  }

  actualizarSeleccion(
    campo: 'ciclo_id' | 'orientacion_sex_id' | 'resul_pap_id' | 'met_anticon_id' | 'resul_mamograf_id',
    valor: SelectValue,
  ): void {
    const numero = valor === null || valor === '' ? null : Number(valor);
    this.formulario.update((actual) => ({ ...actual, [campo]: numero }));
  }

  actualizarTexto(
    campo:
      | 'fur'
      | 'dur_ciclo'
      | 'dur_mes'
      | 'gestas'
      | 'partos'
      | 'abortos'
      | 'hijos_vivos'
      | 'ult_par_abor'
      | 'tiempo_uso_met'
      | 'comentario'
      | 'fecha_ult_pap'
      | 'obs_ginecologica'
      | 'ini_vida_sex'
      | 'parejas_sex'
      | 'obs_sexuales',
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  actualizarIndicador(campo: 'desea_embarazo' | 'acti_sex_actual' | 'uso_preservativo' | 'ets', valor: boolean): void {
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    if (this.formulario().ciclo_id === null || this.formulario().orientacion_sex_id === null) return;
    if (this.guardando()) return;

    const formulario = this.formulario();
    const numero_o_null = (valor: string): number | null => (valor === '' ? null : Number(valor));
    const texto_o_null = (valor: string): string | null => valor.trim() || null;

    const request = {
      atencion_id: this.atencionId(),
      ciclo_id: formulario.ciclo_id!,
      orientacion_sex_id: formulario.orientacion_sex_id!,
      resul_pap_id: formulario.resul_pap_id,
      met_anticon_id: formulario.met_anticon_id,
      resul_mamograf_id: formulario.resul_mamograf_id,
      fur: texto_o_null(formulario.fur),
      dur_ciclo: numero_o_null(formulario.dur_ciclo),
      dur_mes: numero_o_null(formulario.dur_mes),
      gestas: numero_o_null(formulario.gestas),
      partos: numero_o_null(formulario.partos),
      abortos: numero_o_null(formulario.abortos),
      hijos_vivos: numero_o_null(formulario.hijos_vivos),
      ult_par_abor: texto_o_null(formulario.ult_par_abor),
      desea_embarazo: formulario.desea_embarazo,
      tiempo_uso_met: numero_o_null(formulario.tiempo_uso_met),
      comentario: texto_o_null(formulario.comentario),
      fecha_ult_pap: texto_o_null(formulario.fecha_ult_pap),
      obs_ginecologica: texto_o_null(formulario.obs_ginecologica),
      ini_vida_sex: numero_o_null(formulario.ini_vida_sex),
      parejas_sex: numero_o_null(formulario.parejas_sex),
      acti_sex_actual: formulario.acti_sex_actual,
      uso_preservativo: formulario.uso_preservativo,
      ets: formulario.ets,
      obs_sexuales: texto_o_null(formulario.obs_sexuales),
    };

    this.guardando.set(true);
    this.antRepSexService
      .guardar_rep_sex(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.establecerContexto(data);
          this.utilService.mostrar_alerta(
            message ?? 'Antecedente gineco-obstétrico y sexual registrado correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar el antecedente gineco-obstétrico y sexual.',
          ),
      });
  }

  private establecerContexto(contexto: RepSexContexto): void {
    this.contexto.set(contexto);
    this.formulario.set(this.formularioDesdePerfil(contexto.perfil));
    this.perfilChange.emit(contexto.perfil);
  }

  private formularioDesdePerfil(perfil: RepSexPerfil | null): Formulario {
    if (perfil === null) return { ...FORMULARIO_INICIAL };

    const texto = (valor: string | null): string => valor ?? '';
    const numero = (valor: number | null): string => (valor === null ? '' : String(valor));

    return {
      ciclo_id: perfil.ciclo_id,
      orientacion_sex_id: perfil.orientacion_sex_id,
      resul_pap_id: perfil.resul_pap_id,
      met_anticon_id: perfil.met_anticon_id,
      resul_mamograf_id: perfil.resul_mamograf_id,
      fur: texto(perfil.fur),
      dur_ciclo: numero(perfil.dur_ciclo),
      dur_mes: numero(perfil.dur_mes),
      gestas: numero(perfil.gestas),
      partos: numero(perfil.partos),
      abortos: numero(perfil.abortos),
      hijos_vivos: numero(perfil.hijos_vivos),
      ult_par_abor: texto(perfil.ult_par_abor),
      desea_embarazo: !!perfil.desea_embarazo,
      tiempo_uso_met: numero(perfil.tiempo_uso_met),
      comentario: texto(perfil.comentario),
      fecha_ult_pap: texto(perfil.fecha_ult_pap),
      obs_ginecologica: texto(perfil.obs_ginecologica),
      ini_vida_sex: numero(perfil.ini_vida_sex),
      parejas_sex: numero(perfil.parejas_sex),
      acti_sex_actual: !!perfil.acti_sex_actual,
      uso_preservativo: !!perfil.uso_preservativo,
      ets: !!perfil.ets,
      obs_sexuales: texto(perfil.obs_sexuales),
    };
  }
}
