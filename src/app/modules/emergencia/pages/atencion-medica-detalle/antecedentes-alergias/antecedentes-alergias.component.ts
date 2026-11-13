import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { SelectComponent, SelectValue } from '../../../../../components/select/select.component';
import { TableComponent } from '../../../../../components/table/table.component';
import {
  AlergiaContexto,
  AlergiaPaciente,
  RegistrarAlergiaRequest,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { TableColumn } from '../../../../../interfaces/util.interface';
import { AlergiaService } from '../../../../../services/emergencia/alergia.service';
import { UtilService } from '../../../../../services/util.service';

const CONTEXTO_INICIAL: AlergiaContexto = {
  alergias: [],
  tipos: [],
  sustancias: [],
  gravedades: [],
  vias: [],
};

const FORMULARIO_INICIAL = {
  tipo_id: null as number | null,
  sustancia_id: null as number | null,
  gravedad_id: null as number | null,
  via_administracion_id: null as number | null,
  reaccion: '',
  edad_reaccion: '',
  fecha_ultima_reaccion: '',
  descripcion_adicional: '',
};

@Component({
  selector: 'app-antecedentes-alergias',
  standalone: true,
  imports: [ButtonComponent, InputGroupComponent, SelectComponent, TableComponent],
  templateUrl: './antecedentes-alergias.component.html',
  styleUrl: './antecedentes-alergias.component.scss',
})
export class AntecedentesAlergiasComponent implements OnInit {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly alergiasChange = output<AlergiaPaciente[]>();

  private readonly alergiaService = inject(AlergiaService);
  private readonly utilService = inject(UtilService);

  readonly contexto = signal<AlergiaContexto>(CONTEXTO_INICIAL);
  readonly formulario = signal({ ...FORMULARIO_INICIAL });
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly alergias = computed(() => this.contexto().alergias);
  readonly sustanciasFiltradas = computed(() => {
    const tipoId = this.formulario().tipo_id;
    const registradas = new Set(this.alergias().map((alergia) => alergia.sustancia_id));
    return this.contexto().sustancias.filter(
      (sustancia) => sustancia.tipo_id === tipoId && !registradas.has(sustancia.sustancia_id),
    );
  });
  readonly formularioValido = computed(
    () =>
      this.formulario().sustancia_id !== null &&
      this.formulario().gravedad_id !== null &&
      Boolean(this.formulario().reaccion?.trim()),
  );

  readonly columnas: TableColumn<AlergiaPaciente>[] = [
    { key: 'tipo_nombre', label: 'Tipo' },
    { key: 'sustancia_nombre', label: 'Sustancia' },
    { key: 'gravedad_nombre', label: 'Gravedad' },
    {
      key: 'via_administracion_nombre',
      label: 'Vía',
      formatter: (valor) => String(valor ?? '-'),
    },
    { key: 'reaccion', label: 'Reacción', formatter: (valor) => String(valor ?? '-') },
    {
      key: 'fecha_ultima_reaccion',
      label: 'Última reacción',
      formatter: (valor) => String(valor ?? '-'),
    },
    {
      key: 'descripcion_adicional',
      label: 'Detalle',
      formatter: (valor) => String(valor ?? '-'),
    },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.alergiaService
      .obtener_alergias(this.atencionId())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => this.establecerContexto(data),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudieron consultar las alergias.'),
      });
  }

  actualizarSeleccion(
    campo: 'tipo_id' | 'sustancia_id' | 'gravedad_id' | 'via_administracion_id',
    valor: SelectValue,
  ): void {
    const numero = valor === null || valor === '' ? null : Number(valor);
    this.formulario.update((actual) => ({
      ...actual,
      [campo]: numero,
      ...(campo === 'tipo_id' ? { sustancia_id: null } : {}),
    }));
  }

  actualizarTexto(
    campo: 'reaccion' | 'edad_reaccion' | 'fecha_ultima_reaccion' | 'descripcion_adicional',
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    if (!this.formularioValido() || this.guardando()) return;

    const formulario = this.formulario();
    const request: RegistrarAlergiaRequest = {
      atencion_id: this.atencionId(),
      sustancia_id: formulario.sustancia_id!,
      gravedad_id: formulario.gravedad_id!,
      via_administracion_id: formulario.via_administracion_id,
      reaccion: formulario.reaccion.trim() || null,
      edad_reaccion: formulario.edad_reaccion === '' ? null : Number(formulario.edad_reaccion),
      fecha_ultima_reaccion: formulario.fecha_ultima_reaccion || null,
      descripcion_adicional: formulario.descripcion_adicional.trim() || null,
    };

    this.guardando.set(true);
    this.alergiaService
      .guardar_alergia(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.establecerContexto(data);
          this.formulario.set({ ...FORMULARIO_INICIAL });
          this.utilService.mostrar_alerta(
            message ?? 'Alergia registrada correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo registrar la alergia.'),
      });
  }

  private establecerContexto(contexto: AlergiaContexto): void {
    this.contexto.set(contexto);
    this.alergiasChange.emit(contexto.alergias);
  }
}
