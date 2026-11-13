import { Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, of, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { SelectComponent, SelectValue } from '../../../../../components/select/select.component';
import { TableComponent } from '../../../../../components/table/table.component';
import { CatalogoEmergenciaCodigoOption } from '../../../../../interfaces/emergencia/catalogo-emergencia.interface';
import {
  AntecedenteFamiliarPaciente,
  AntecedentesFamiliaresContexto,
  DiagnosticoCatalogo,
  RegistrarAntecedenteFamiliarRequest,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { TableColumn } from '../../../../../interfaces/util.interface';
import { AntFamiliarService } from '../../../../../services/emergencia/ant-familiar.service';
import { CatalogoEmergenciaService } from '../../../../../services/emergencia/catalogo-emergencia.service';
import { DiagnosticoService } from '../../../../../services/emergencia/diagnostico.service';
import { UtilService } from '../../../../../services/util.service';

const CONTEXTO_INICIAL: AntecedentesFamiliaresContexto = {
  familiares: [],
  estados: [],
};

const FORMULARIO_INICIAL = {
  parentesco_id: null as number | null,
  estado_id: null as number | null,
  edad_fam: '',
  comentario: '',
};

@Component({
  selector: 'app-antecedentes-familiares',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputGroupComponent, SelectComponent, TableComponent],
  templateUrl: './antecedentes-familiares.component.html',
  styleUrl: './antecedentes-familiares.component.scss',
})
export class AntecedentesFamiliaresComponent implements OnInit {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly familiaresChange = output<AntecedenteFamiliarPaciente[]>();

  private readonly antFamiliarService = inject(AntFamiliarService);
  private readonly diagnosticoService = inject(DiagnosticoService);
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly utilService = inject(UtilService);
  private readonly destroyRef = inject(DestroyRef);

  readonly diagnosticoBusquedaControl = new FormControl('', { nonNullable: true });

  readonly contexto = signal<AntecedentesFamiliaresContexto>(CONTEXTO_INICIAL);
  readonly parentescos = signal<CatalogoEmergenciaCodigoOption[]>([]);
  readonly formulario = signal({ ...FORMULARIO_INICIAL });
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly diagnosticoSeleccionado = signal<DiagnosticoCatalogo | null>(null);
  readonly terminoDiagnostico = signal('');
  readonly resultadosDiagnostico = signal<DiagnosticoCatalogo[]>([]);
  readonly buscandoDiagnostico = signal(false);

  readonly familiares = computed(() => this.contexto().familiares);
  readonly formularioValido = computed(
    () =>
      this.diagnosticoSeleccionado() !== null &&
      this.formulario().parentesco_id !== null &&
      this.formulario().estado_id !== null,
  );

  readonly columnas: TableColumn<AntecedenteFamiliarPaciente>[] = [
    { key: 'diagnostico_nombre', label: 'Diagnóstico' },
    { key: 'parentesco_nombre', label: 'Parentesco' },
    { key: 'estado_nombre', label: 'Estado' },
    { key: 'edad_familiar', label: 'Edad', formatter: (valor) => String(valor ?? '-') },
    { key: 'comentario', label: 'Comentario', formatter: (valor) => String(valor ?? '-') },
  ];

  ngOnInit(): void {
    this.iniciarBusquedaDiagnostico();
    this.cargar();
    this.cargar_parentescos();
  }

  private iniciarBusquedaDiagnostico(): void {
    this.diagnosticoBusquedaControl.valueChanges
      .pipe(
        debounceTime(450),
        distinctUntilChanged(),
        switchMap((termino) => {
          const limpio = termino.trim();
          this.terminoDiagnostico.set(limpio);

          if (limpio.length < 2) {
            this.resultadosDiagnostico.set([]);
            this.buscandoDiagnostico.set(false);
            return of([] as DiagnosticoCatalogo[]);
          }

          this.buscandoDiagnostico.set(true);
          return this.diagnosticoService.buscar_diagnosticos(limpio).pipe(
            finalize(() => this.buscandoDiagnostico.set(false)),
            switchMap(({ data }) => of(data ?? [])),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => this.resultadosDiagnostico.set(data),
        error: (error: { message?: string }) => {
          this.resultadosDiagnostico.set([]);
          this.buscandoDiagnostico.set(false);
          this.utilService.mostrar_error(error.message ?? 'No se pudo buscar el diagnóstico.');
        },
      });
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.antFamiliarService
      .obtener_antecedentes_familiares(this.atencionId())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => this.establecerContexto(data),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudieron consultar los antecedentes familiares.',
          ),
      });
  }

  seleccionarDiagnostico(diagnostico: DiagnosticoCatalogo): void {
    this.diagnosticoSeleccionado.set(diagnostico);
    this.diagnosticoBusquedaControl.setValue(`${diagnostico.codigo} - ${diagnostico.descripcion}`, { emitEvent: false });
    this.terminoDiagnostico.set('');
    this.resultadosDiagnostico.set([]);
  }

  limpiarDiagnostico(): void {
    this.diagnosticoSeleccionado.set(null);
    this.diagnosticoBusquedaControl.setValue('', { emitEvent: false });
    this.terminoDiagnostico.set('');
    this.resultadosDiagnostico.set([]);
  }

  actualizarSeleccion(campo: 'parentesco_id' | 'estado_id', valor: SelectValue): void {
    const numero = valor === null || valor === '' ? null : Number(valor);
    this.formulario.update((actual) => ({ ...actual, [campo]: numero }));
  }

  actualizarTexto(campo: 'edad_fam' | 'comentario', evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.formulario.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardar(): void {
    if (!this.formularioValido() || this.guardando()) return;

    const formulario = this.formulario();
    const request: RegistrarAntecedenteFamiliarRequest = {
      atencion_id: this.atencionId(),
      cie10_id: this.diagnosticoSeleccionado()!.cie10_id,
      parentesco_id: formulario.parentesco_id!,
      estado_id: formulario.estado_id!,
      edad_fam: formulario.edad_fam === '' ? null : Number(formulario.edad_fam),
      comentario: formulario.comentario.trim() || null,
    };

    this.guardando.set(true);
    this.antFamiliarService
      .guardar_antecedente_familiar(request)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.establecerContexto(data);
          this.formulario.set({ ...FORMULARIO_INICIAL });
          this.limpiarDiagnostico();
          this.utilService.mostrar_alerta(
            message ?? 'Antecedente familiar registrado correctamente.',
            'success',
          );
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo registrar el antecedente familiar.',
          ),
      });
  }

  private cargar_parentescos(): void {
    this.catalogoEmergenciaService.obtenerCatalogos(['parentescos']).subscribe({
      next: ({ data }) => this.parentescos.set(data.parentescos),
      error: (error: { message?: string }) =>
        this.utilService.mostrar_error(
          error.message ?? 'No se pudo consultar el catálogo de parentescos.',
        ),
    });
  }

  private establecerContexto(contexto: AntecedentesFamiliaresContexto): void {
    this.contexto.set(contexto);
    this.familiaresChange.emit(contexto.familiares);
  }
}
