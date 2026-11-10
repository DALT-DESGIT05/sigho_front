import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { disabled, email, form, FormField, required } from '@angular/forms/signals';
import {
  AlergiaPaciente,
  DetalleAtencionPaciente,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { PaletteColor } from '../../../../../interfaces/util.interface';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CardGeneralComponent } from '../../../../../components/card-general/card-general.component';
import { InputTextComponent } from '../../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { PatientIdentityComponent } from '../../../../../components/patient-identity/patient-identity.component';
import { SummaryCardComponent } from '../../../../../components/summary-card/summary-card.component';
import { SummaryCardGroupComponent } from '../../../../../components/summary-card-group/summary-card-group.component';
import { PacienteService } from '../../../../../services/emergencia/paciente.service';

@Component({
  selector: 'app-emergency-patient-card',
  standalone: true,
  imports: [
    FormField,
    ButtonComponent,
    CardGeneralComponent,
    InputTextComponent,
    ModalComponent,
    PatientIdentityComponent,
    SummaryCardComponent,
    SummaryCardGroupComponent,
  ],
  templateUrl: './emergency-patient-card.component.html',
  styleUrl: './emergency-patient-card.component.scss',
})
export class EmergencyPatientCardComponent {
  readonly paciente = input.required<DetalleAtencionPaciente>();
  readonly alergias = input<AlergiaPaciente[]>([]);
  private readonly paciente_service = inject(PacienteService);

  private readonly celular_override = signal<string | null>(null);
  private readonly correo_override = signal<string | null>(null);

  readonly contactPhone = computed(() => this.celular_override() ?? this.paciente().celular);
  readonly contactEmail = computed(() => this.correo_override() ?? this.paciente().correo_electronico);

  readonly nombre_paciente = computed(() => {
    const paciente = this.paciente();
    const grado = paciente.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = paciente.situacion?.toUpperCase()?.trim();
    const sufijoSituacion = situacion === 'RETIRO' ? '(r)' : null;

    const partesGrado = [grado, sufijoSituacion].filter(Boolean).join(' ');

    let nombre = '';
    if (paciente.apellido_paterno || paciente.apellido_materno || paciente.nombres) {
      const apellidos = [paciente.apellido_paterno, paciente.apellido_materno]
        .map((value) => value?.toUpperCase()?.trim())
        .filter(Boolean)
        .join(' ');
      const nombres = (paciente.nombres || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(' ');
      nombre = [apellidos, nombres].filter(Boolean).join(' ');
    } else {
      nombre = (paciente.nombre_completo?.trim() || '');
    }

    return partesGrado ? `${partesGrado} ${nombre}` : nombre;
  });

  readonly tieneAlergiaGrave = computed(() =>
    this.alergias().some((alergia) => alergia.gravedad_codigo === 'G'),
  );
  readonly resumenAlergias = computed(() =>
    this.alergias()
      .map((alergia) => `${alergia.sustancia_nombre} (${alergia.gravedad_nombre})`)
      .join(', '),
  );

  /** Mismo patrón de modal de contacto único que usa Admisión (admision.components.ts). */
  private readonly contacto_modal = viewChild.required<ModalComponent>('contacto_modal');
  private readonly datos_titular_modal = viewChild<ModalComponent>('datos_titular_modal');
  readonly guardando_contacto = signal(false);
  readonly validacion_contacto_solicitada = signal(false);
  readonly contacto_campo = signal<'celular' | 'correo_electronico'>('celular');
  readonly contacto_model = signal({ valor: '' });
  readonly contacto_form = form(this.contacto_model, (schema) => {
    required(schema.valor);
    email(schema.valor, { when: () => this.contacto_campo() === 'correo_electronico' });
    disabled(schema.valor, { when: () => this.guardando_contacto() });
  });
  readonly contacto_titulo = computed(() =>
    this.contacto_campo() === 'celular' ? 'Actualizar teléfono' : 'Actualizar correo',
  );
  private readonly contacto_api_error = signal('');

  color_situacion(situacion: string | null | undefined): PaletteColor {
    return situacion === 'ACTIVIDAD' ? 'success' : situacion === 'RETIRO' ? 'warning' : 'primary';
  }

  es_derechohabiente(parentesco: string | null | undefined): boolean {
    if (!parentesco) {
      return false;
    }
    const normalizado = parentesco
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
    return normalizado !== 'TITULAR' && normalizado !== 'T' && normalizado !== 'A';
  }

  abrir_modal_datos_titular(): void {
    this.datos_titular_modal()?.open();
  }

  abrir_modal_contacto(campo: 'celular' | 'correo_electronico'): void {
    this.contacto_campo.set(campo);
    this.contacto_model.set({
      valor: (campo === 'celular' ? this.contactPhone() : this.contactEmail()) ?? '',
    });
    this.contacto_api_error.set('');
    this.validacion_contacto_solicitada.set(false);
    this.contacto_modal().open();
  }

  guardar_contacto(): void {
    if (this.guardando_contacto()) {
      return;
    }

    this.validacion_contacto_solicitada.set(true);
    this.contacto_api_error.set('');
    if (!this.contacto_form().valid()) {
      this.contacto_form.valor().markAsTouched();
      return;
    }

    const campo = this.contacto_campo();
    const valor = this.contacto_model().valor.trim();
    const request = {
      persona_id: this.paciente().paciente_id,
      celular: campo === 'celular' ? valor : this.contactPhone(),
      correo_electronico: campo === 'correo_electronico' ? valor : this.contactEmail(),
    };

    this.guardando_contacto.set(true);
    this.paciente_service.actualizarContacto(request).subscribe({
      next: ({ data }) => {
        this.guardando_contacto.set(false);
        this.celular_override.set(data.celular);
        this.correo_override.set(data.correo_electronico);
        this.contacto_modal().close();
      },
      error: (error: { message?: string; errors?: Record<string, string[]> }) => {
        this.guardando_contacto.set(false);
        this.contacto_api_error.set(
          error.errors?.[campo]?.[0] ??
            error.message ??
            'No se pudieron actualizar los datos de contacto.',
        );
      },
    });
  }

  error_contacto(): string {
    if (this.contacto_api_error()) {
      return this.contacto_api_error();
    }
    if (!this.validacion_contacto_solicitada()) {
      return '';
    }

    const errors = this.contacto_form.valor().errors();
    if (errors.some((error) => error.kind === 'required')) {
      return `Ingrese ${this.contacto_campo() === 'celular' ? 'el celular' : 'el correo electrónico'}.`;
    }

    return errors.some((error) => error.kind === 'email')
      ? 'Ingrese un correo electrónico válido.'
      : '';
  }

  limpiar_modal_contacto(): void {
    this.guardando_contacto.set(false);
    this.validacion_contacto_solicitada.set(false);
    this.contacto_api_error.set('');
  }
}
