import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CheckComponent } from '../../../../../components/check/check.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { SelectComponent, SelectValue } from '../../../../../components/select/select.component';
import { TableComponent } from '../../../../../components/table/table.component';
import { HabitoPaciente, HabitosContexto } from '../../../../../interfaces/emergencia/triaje.interface';
import { TableColumn } from '../../../../../interfaces/util.interface';
import { AntHabitoService } from '../../../../../services/emergencia/ant-habito.service';
import { UtilService } from '../../../../../services/util.service';

const CONTEXTO_INICIAL: HabitosContexto = {
  habitos: [],
  catalogo: [],
  estados: [],
};

const FORMULARIO_INICIAL = {
  habito_id: null as number | null,
  estado_id: null as number | null,
  tiempo_consumo: '',
  fecha_inicio_consu: '',
  fecha_termino_cons: '',
  ind_act_realiza: false,
  observacion: '',
};

@Component({
  selector: 'app-antecedentes-habitos',
  standalone: true,
  imports: [ButtonComponent, CheckComponent, InputGroupComponent, SelectComponent, TableComponent],
  templateUrl: './antecedentes-habitos.component.html',
  styleUrl: './antecedentes-habitos.component.scss',
})
export class AntecedentesHabitosComponent implements OnInit {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly habitosChange = output<HabitoPaciente[]>();

  private readonly antHabitoService = inject(AntHabitoService);
  private readonly utilService = inject(UtilService);

  readonly contexto = signal<HabitosContexto>(CONTEXTO_INICIAL);
  readonly formulario = signal({ ...FORMULARIO_INICIAL });
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly habitos = computed(() => this.contexto().habitos);
  readonly catalogoDisponible = computed(() => {
    const registrados = new Set(this.habitos().map((habito) => habito.habito_id));
    return this.contexto().catalogo.filter((habito) => !registrados.has(habito.habito_id));
  });
  readonly formularioValido = computed(
    () => this.formulario().habito_id !== null && this.formulario().estado_id !== null,
  );

  readonly columnas: TableColumn<HabitoPaciente>[] = [
    { key: 'habito_nombre', label: 'Hábito' },
    { key: 'estado_nombre', label: 'Estado' },
    { key: 'tiempo_consumo', label: 'Tiempo de consumo', formatter: (valor) => String(valor ?? '-') },
    {
      key: 'ind_act_realiza',
      label: '¿Lo realiza actualmente?',
      formatter: (valor) => (valor === null ? '-' : valor ? 'Sí' : 'No'),
    },
    { key: 'observacion', label: 'Observación', formatter: (valor) => String(valor ?? '-') },
  ];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.antHabitoService
      .obtener_habitos(this.atencionId())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => this.establecerContexto(data),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudieron consultar los hábitos.'),
      });
  }

  actualizarSeleccion(campo: 'habito_id' | 'estado_id', valor: SelectValue): void {
    const numero = valor === null || valor === '' ? null : Number(valor);
    this.formulario.update((actual) => ({ ...actual, [campo]: numero }));
  }

  actualizarTexto(
    campo: 'tiempo_consumo' | 'fecha_inicio_consu' | 'fecha_termino_cons' | 'observacion',
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  actualizarIndicador(valor: boolean): void {
    this.formulario.update((actual) => ({ ...actual, ind_act_realiza: valor }));
  }

  guardar(): void {
    if (!this.formularioValido() || this.guardando()) return;

    const formulario = this.formulario();
    const request = {
      atencion_id: this.atencionId(),
      habito_id: formulario.habito_id!,
      estado_id: formulario.estado_id!,
      tiempo_consumo: formulario.tiempo_consumo === '' ? null : Number(formulario.tiempo_consumo),
      fecha_inicio_consu: formulario.fecha_inicio_consu || null,
      fecha_termino_cons: formulario.fecha_termino_cons || null,
      ind_act_realiza: formulario.ind_act_realiza,
      observacion: formulario.observacion.trim() || null,
    };

    this.guardando.set(true);
    this.antHabitoService
      .guardar_habito(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.establecerContexto(data);
          this.formulario.set({ ...FORMULARIO_INICIAL });
          this.utilService.mostrar_alerta(message ?? 'Hábito registrado correctamente.', 'success');
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(error.message ?? 'No se pudo registrar el hábito.'),
      });
  }

  private establecerContexto(contexto: HabitosContexto): void {
    this.contexto.set(contexto);
    this.habitosChange.emit(contexto.habitos);
  }
}
