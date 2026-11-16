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
  readonly contactEmail = computed(
    () => this.correo_override() ?? this.paciente().correo_electronico,
  );

  readonly es_afiliado_paciente = computed(() => {
    const pac = this.paciente();
    if (pac.cod_situ !== null && pac.cod_situ !== undefined) {
      return [1, 11, 12].includes(Number(pac.cod_situ));
    }
    return Boolean(pac.codigo_afiliado);
  });

  readonly es_fap = computed(() => {
    const pac = this.paciente();
    if (pac.tipo_persona_fap !== null && pac.tipo_persona_fap !== undefined) {
      return Number(pac.tipo_persona_fap) === 1;
    }
    if (pac.es_fap !== undefined && pac.es_fap !== null) {
      return Boolean(pac.es_fap);
    }
    return (
      this.es_afiliado_paciente() ||
      Boolean(pac.codigo_afiliado || pac.nsa || pac.grado || pac.grado_codigo)
    );
  });

  readonly tipo_paciente_texto = computed(() => (this.es_fap() ? 'FAP' : 'EXTRAFAP'));

  readonly titulo_card_paciente = computed(() => `Paciente (${this.tipo_paciente_texto()})`);

  readonly etiqueta_paciente = computed(() => `Paciente ${this.tipo_paciente_texto()}`);

  readonly es_titular_paciente = computed(() => {
    const pac = this.paciente();
    const paren = pac.parentesco?.trim();
    if (!paren) return true;
    const normalizado = paren
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
    return normalizado === 'TITULAR' || normalizado === 'T' || normalizado === 'A';
  });

  readonly parentesco_card_valor = computed(() => {
    if (this.es_titular_paciente()) {
      return 'TITULAR';
    }
    return this.paciente().parentesco || 'No registrado';
  });

  readonly badge_iafas_header = computed(() => {
    const pac = this.paciente();
    if (!this.es_afiliado_paciente()) {
      return null;
    }
    return 'AFILIADO IAFAS - FOSFAP';
  });

  readonly nombre_titular_completo = computed(() => {
    const pac = this.paciente();
    const grado = pac.titular_grado?.trim() || null;
    const situacion = pac.situacion?.toUpperCase()?.trim();
    const sufijoRetiro = situacion === 'RETIRO' ? '(r)' : null;
    const partesGrado = [grado, sufijoRetiro].filter(Boolean).join(' ');
    const nombre = pac.titular_nombre?.trim() || '';

    if (partesGrado && nombre) {
      return `${partesGrado} ${nombre}`;
    }
    return partesGrado || nombre || 'No registrado';
  });

  readonly parentesco_paciente = computed(() => {
    const pac = this.paciente();
    if (this.es_titular_paciente()) {
      return 'TITULAR';
    }
    return pac.parentesco?.trim() || 'No registrado';
  });

  readonly hc_nsa = computed(() => {
    const pac = this.paciente();
    const nsa = pac.nsa?.trim();
    const letra = (
      pac.codigo_parentesco?.trim() || (this.es_titular_paciente() ? 'A' : '')
    ).toUpperCase();
    if (nsa) {
      const nsaLetra =
        letra && !nsa.toUpperCase().endsWith(letra) ? `${nsa}${letra}` : nsa.toUpperCase();
      return `HC - ${nsaLetra}`;
    }
    if (pac.numero_historia) {
      const his = pac.numero_historia.trim();
      return his.toUpperCase().startsWith('HC') ? his : `HC - ${his}`;
    }
    return null;
  });

  readonly condiciones_especiales = computed<string[]>(() => {
    const pac = this.paciente();
    const condiciones: string[] = [];

    const esDiscapacitado =
      Boolean(pac.es_discapacitado) ||
      Number(pac.ind_discapacitado) === 1 ||
      pac.ind_discapacitado === true;

    if (esDiscapacitado) {
      condiciones.push('DISCAPACITADO');
    }

    const esDefensorPatria =
      Boolean(pac.es_defensor_patria) ||
      Number(pac.ind_defensor_patria) === 1 ||
      pac.ind_defensor_patria === true;

    if (esDefensorPatria) {
      condiciones.push('DEFENSOR DE LA PATRIA');
    }

    return condiciones;
  });

  readonly nombre_paciente = computed(() => {
    const paciente = this.paciente();
    const grado = paciente.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = paciente.situacion?.toUpperCase()?.trim();
    const esTitular = Boolean(grado) || paciente.parentesco?.toUpperCase()?.trim() === 'TITULAR';
    const sufijoSituacion = esTitular && grado && situacion === 'RETIRO' ? '(r)' : null;

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
      nombre = paciente.nombre_completo?.trim() || '';
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
    const normalizado = situacion?.toUpperCase()?.trim();
    return normalizado === 'ACTIVIDAD'
      ? 'success'
      : normalizado === 'RETIRO'
        ? 'danger'
        : 'primary';
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
