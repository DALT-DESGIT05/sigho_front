import { Component, computed, input, output } from '@angular/core';

export interface PatientSummaryData {
  paciente?: string | null;
  nombres?: string | null;
  edad?: string | number | null;
  sexo?: string | null;
  grupo_sanquineo?: string | null;
  grupo_sanguineo?: string | null;
  nombre_titular?: string | null;
  titular?: string | null;
  telefono?: string | null;
  celular?: string | null;
  email?: string | null;
  dni?: string | number | null;
  estado?: string | null;
  forma_pago?: string | null;
  historia?: string | number | null;
}

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.scss',
})
export class PatientSummaryComponent {
  readonly patient = input.required<PatientSummaryData>();
  readonly showDemographics = input(true);
  readonly showPhone = input(false);
  readonly showEmail = input(false);
  readonly showDni = input(false);
  readonly showStatus = input(false);
  readonly showPaymentMethod = input(false);
  readonly allowPhoneUpdate = input(false);
  readonly allowEmailUpdate = input(false);
  readonly phoneUpdate = output<void>();
  readonly emailUpdate = output<void>();

  readonly patientName = computed(() => this.value(this.patient().paciente || this.patient().nombres));
  readonly bloodGroup = computed(() => this.value(this.patient().grupo_sanquineo || this.patient().grupo_sanguineo, 'No registrado'));
  readonly age = computed(() => {
    const age = this.value(this.patient().edad);
    return age === 'No registrado' || /a(?:\u00f1|n)os/i.test(age) ? age : `${age} a\u00f1os`;
  });
  readonly responsibleName = computed(() => this.value(this.patient().nombre_titular || this.patient().titular, 'No registrado'));
  readonly phone = computed(() => this.value(this.patient().telefono || this.patient().celular, 'No registrado'));

  value(value: unknown, fallback = 'No registrado'): string {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
  }
}
