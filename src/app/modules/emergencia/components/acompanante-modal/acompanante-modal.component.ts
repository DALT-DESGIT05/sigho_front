import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { email, form, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import {
  AutoCompleteComponent,
  AutoCompleteDataSource,
} from '../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { CheckComponent } from '../../../../components/check/check.component';
import { InputGroupComponent } from '../../../../components/input-group/input-group.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import {
  AcompananteBusqueda,
  AcompananteFormValue,
  RegistrarAcompananteRequest,
  RegistrarAcompananteResponse,
} from '../../../../interfaces/emergencia/acompanante.interface';
import {
  AcompananteBusquedaService,
  AcompananteOpcion,
} from '../../../../services/emergencia/acompanante-busqueda.service';
import { AcompananteService } from '../../../../services/emergencia/acompanante.service';
import { UtilService } from '../../../../services/util.service';

const ACOMPANANTE_INICIAL: AcompananteFormValue = {
  fap: true,
  extrafap: false,
  tipoDocumentoId: null,
  numero: '',
  sexoCodigo: '',
  fechaNacimiento: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  nombres: '',
  parentescoId: null,
  celular: '',
  correoElectronico: '',
};

@Component({
  selector: 'app-acompanante-modal',
  imports: [
    AutoCompleteComponent,
    ButtonComponent,
    CardGeneralComponent,
    CheckComponent,
    InputGroupComponent,
    InputTextComponent,
    ModalComponent,
    SelectComponent,
  ],
  templateUrl: './acompanante-modal.component.html',
  styleUrl: './acompanante-modal.component.scss',
})
export class AcompananteModalComponent {
  private readonly acompananteService = inject(AcompananteService);
  private readonly acompananteBusquedaService = inject(AcompananteBusquedaService);
  private readonly utilService = inject(UtilService);

  readonly pacienteId = input<number | null>(null);
  readonly separateFromParent = input(false);
  readonly tipoDocumentoOptions = input<SelectOption[]>([]);
  readonly sexoOptions = input<SelectOption[]>([]);
  readonly parentescoOptions = input<SelectOption[]>([]);
  readonly registrado = output<RegistrarAcompananteResponse>();
  readonly modal = viewChild.required<ModalComponent>('acompananteModal');

  readonly acompanante_model = signal<AcompananteFormValue>({ ...ACOMPANANTE_INICIAL });
  readonly acompanante_form = form(this.acompanante_model, (schema) => {
    required(schema.tipoDocumentoId);
    required(schema.numero);
    required(schema.sexoCodigo);
    required(schema.apellidoPaterno);
    required(schema.apellidoMaterno);
    required(schema.nombres);
    required(schema.parentescoId);
    email(schema.correoElectronico);
  });
  readonly guardando = signal(false);
  readonly maxFechaNacimiento = new Date().toISOString().slice(0, 10);

  actualizar_texto(
    campo:
      | 'numero'
      | 'apellidoPaterno'
      | 'apellidoMaterno'
      | 'nombres'
      | 'fechaNacimiento'
      | 'celular'
      | 'correoElectronico',
    valor: string | number | null | undefined,
  ): void {
    this.acompanante_model.update((acompanante) => ({
      ...acompanante,
      [campo]: String(valor ?? ''),
    }));
  }

  actualizar_documento(valor: string | number | null): void {
    this.acompanante_model.update((acompanante) => ({
      ...acompanante,
      tipoDocumentoId: valor === null || valor === '' ? null : Number(valor),
    }));
  }

  actualizar_sexo(valor: string | number | null): void {
    this.acompanante_model.update((acompanante) => ({
      ...acompanante,
      sexoCodigo: String(valor ?? ''),
    }));
  }

  actualizar_parentesco(valor: string | number | null): void {
    this.acompanante_model.update((acompanante) => ({
      ...acompanante,
      parentescoId: valor === null || valor === '' ? null : Number(valor),
    }));
  }

  readonly buscar_acompanantes: AutoCompleteDataSource<AcompananteOpcion> = (term) =>
    this.acompananteBusquedaService.buscar(
      term,
      this.acompanante_model().fap ? 1 : 0,
      this.pacienteId(),
    );

  seleccionar_acompanante(acompanante: AcompananteOpcion): void {
    if (acompanante.persona) {
      this.cargar_persona(acompanante.persona);
    }
  }

  limpiar_acompanante(): void {
    const { fap, extrafap, parentescoId } = this.acompanante_model();
    this.acompanante_model.set({ ...ACOMPANANTE_INICIAL, fap, extrafap, parentescoId });
  }

  cambiar_fap(checked: boolean): void {
    if (!checked) return;

    this.acompanante_model.set({ ...ACOMPANANTE_INICIAL, fap: true, extrafap: false });
  }

  cambiar_extrafap(checked: boolean): void {
    if (!checked) return;

    this.acompanante_model.set({ ...ACOMPANANTE_INICIAL, fap: false, extrafap: true });
  }

  open(): void {
    this.modal().open();
  }

  guardar(): void {
    if (this.guardando()) {
      return;
    }

    const pacienteId = this.pacienteId();
    if (!pacienteId) {
      this.utilService.mostrar_alerta(
        'Seleccione un paciente antes de registrar al acompañante.',
        'warning',
      );
      return;
    }

    if (!this.acompanante_form().valid()) {
      this.acompanante_form().markAsTouched();
      this.utilService.mostrar_alerta(
        'Complete los datos obligatorios del acompañante.',
        'warning',
      );
      return;
    }

    const value = this.acompanante_model();
    if (value.tipoDocumentoId === null || value.parentescoId === null) return;

    const tipoDocumento = this.tipoDocumentoOptions().find(
      (option) => Number(option.value) === value.tipoDocumentoId,
    );
    const codigoDocumento = (tipoDocumento?.detail || tipoDocumento?.label || '').toUpperCase();
    const documentoValido =
      codigoDocumento.includes('DNI')
        ? /^\d{8}$/.test(value.numero)
        : codigoDocumento.includes('CE')
          ? /^[A-Z0-9]{1,15}$/i.test(value.numero)
        : codigoDocumento.includes('PAS')
          ? /^[A-Z0-9]{1,20}$/i.test(value.numero)
          : /^[A-Z0-9]{1,45}$/i.test(value.numero);
    const nombresValidos = [value.nombres, value.apellidoPaterno, value.apellidoMaterno]
      .filter(Boolean)
      .every((nombre) => /^[\p{L}\s'’-]+$/u.test(nombre));
    const celularValido = !value.celular || /^\+?[0-9][0-9\s-]{7,19}$/.test(value.celular);

    if (!documentoValido || !nombresValidos || !celularValido) {
      this.utilService.mostrar_alerta(
        'Verifique el formato del documento, nombres, apellidos y celular.',
        'warning',
      );
      return;
    }

    const request: RegistrarAcompananteRequest = {
      paciente_id: pacienteId,
      tipo_documento_id: value.tipoDocumentoId,
      numero_documento: value.numero,
      sexo_codigo: value.sexoCodigo,
      nombres: value.nombres,
      apellido_paterno: value.apellidoPaterno,
      apellido_materno: value.apellidoMaterno || null,
      fecha_nacimiento: value.fechaNacimiento || null,
      parentesco_id: value.parentescoId,
      tipo_acompanante: value.fap ? 1 : 0,
      celular: value.celular || null,
      correo_electronico: value.correoElectronico || null,
    };

    this.guardando.set(true);
    this.acompananteService
      .registrar(request, true)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.registrado.emit(data);
          this.utilService.mostrar_alerta(message ?? 'Acompañante registrado correctamente.');
          this.acompanante_model.set({ ...ACOMPANANTE_INICIAL });
          this.modal().close();
        },
        error: (error: { message?: string }) => {
          this.utilService.mostrar_error(error.message ?? 'No se pudo registrar al acompañante.');
        },
      });
  }

  cerrar_modal(): void {
    this.modal().close();
  }

  private buscar_opcion(opciones: SelectOption[], valor: string): number | null {
    const normalizado = valor.trim().toUpperCase();
    const opcion = opciones.find(
      (item) =>
        item.label.trim().toUpperCase() === normalizado ||
        String((item as SelectOption & { codigo?: string }).codigo ?? '').toUpperCase() ===
          normalizado,
    );

    return typeof opcion?.value === 'number' ? opcion.value : null;
  }

  private cargar_persona(persona: AcompananteBusqueda): void {
    this.acompanante_model.update((value) => ({
      ...value,
      tipoDocumentoId: persona.tipo_documento_id,
      numero: persona.numero_documento,
      sexoCodigo: persona.sexo_codigo,
      fechaNacimiento: persona.fecha_nacimiento ?? '',
      apellidoPaterno: persona.apellido_paterno,
      apellidoMaterno: persona.apellido_materno ?? '',
      nombres: persona.nombres,
      parentescoId: persona.parentesco_id ?? value.parentescoId,
      celular: persona.celular ?? '',
      correoElectronico: persona.correo_electronico ?? '',
    }));
  }
}
