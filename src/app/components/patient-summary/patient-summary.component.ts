import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
  standalone: true,
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientSummaryComponent {
  @Input({ required: true }) patient!: PatientSummaryData;
  @Input() showDemographics = true;
  @Input() showPhone = false;
  @Input() showEmail = false;
  @Input() showDni = false;
  @Input() showStatus = false;
  @Input() showPaymentMethod = false;
  @Input() allowPhoneUpdate = false;
  @Input() allowEmailUpdate = false;
  @Output() phoneUpdate = new EventEmitter<void>();
  @Output() emailUpdate = new EventEmitter<void>();

  get patientName(): string {
    return this.value(this.patient?.paciente || this.patient?.nombres);
  }

  get bloodGroup(): string {
    return this.value(this.patient?.grupo_sanquineo || this.patient?.grupo_sanguineo, 'No registrado');
  }

  get age(): string {
    const age = this.value(this.patient?.edad);
    return age === 'No registrado' || /a(?:ñ|n)os/i.test(age) ? age : `${age} años`;
  }

  get responsibleName(): string {
    return this.value(this.patient?.nombre_titular || this.patient?.titular, 'No registrado');
  }

  get phone(): string {
    return this.value(this.patient?.telefono || this.patient?.celular, 'No registrado');
  }

  value(value: unknown, fallback = 'No registrado'): string {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
  }
}
