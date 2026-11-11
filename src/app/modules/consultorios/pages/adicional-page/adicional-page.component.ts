
import { Component, signal,computed, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { AutoCompleteComponent } from '../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { PatientSummaryComponent,PatientSummaryData } from '../../../../components/patient-summary/patient-summary.component';
import { ModalProgramacionAdicionalComponent } from '../../components/adicional-page/modal-programacion-adicional/modal-programacion-adicional.component';

interface PacienteAdicional {
  codigo_paciente: number;
  historia_clinica: string;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
}

@Component({
  selector: 'app-adicional-page',
  standalone: true,
  imports:[
            ReactiveFormsModule,CardGeneralComponent,AutoCompleteComponent,ButtonComponent,PatientSummaryComponent,SelectComponent,ModalProgramacionAdicionalComponent
          ],
  templateUrl: './adicional-page.component.html',
  styleUrl: './adicional-page.component.scss'
})
export class AdicionalPageComponent {

  readonly pacienteControl = new FormControl<PacienteAdicional | null>(null);
  readonly pacienteSeleccionado = signal<PacienteAdicional | null>(null);
  readonly pacienteConsultado = signal<PacienteAdicional | null>(null);
  private readonly fb = new FormBuilder();
  readonly modalProgramacion = viewChild<ModalProgramacionAdicionalComponent>('modalProgramacion');

  // Datos ficticios únicamente para diseñar la pantalla.
  private readonly pacientesMock: PacienteAdicional[] = [
    {
      codigo_paciente: 1,
      historia_clinica: '100245',
      dni: '45678912',
      nombres: 'JUAN CARLOS',
      apellido_paterno: 'PEREZ',
      apellido_materno: 'GARCIA'
    },
    {
      codigo_paciente: 2,
      historia_clinica: '100246',
      dni: '47896521',
      nombres: 'MARIA ELENA',
      apellido_paterno: 'RAMIREZ',
      apellido_materno: 'LOPEZ'
    },
    {
      codigo_paciente: 3,
      historia_clinica: '100247',
      dni: '42589631',
      nombres: 'LUIS ALBERTO',
      apellido_paterno: 'FLORES',
      apellido_materno: 'TORRES'
    }
  ];

  readonly buscarPacientes = (texto: string): Observable<readonly PacienteAdicional[]> => {

    const termino = this.normalizarTexto(texto);

    if (!termino) {
      return of([]);
    }

    const resultados = this.pacientesMock.filter(paciente => {
      const contenido = [ paciente.historia_clinica,paciente.dni, paciente.nombres, paciente.apellido_paterno, paciente.apellido_materno, `${paciente.apellido_paterno} ${paciente.apellido_materno} ${paciente.nombres}`
      ].map(valor => this.normalizarTexto(valor));

      return contenido.some(valor => valor.includes(termino));
    });

    return of(resultados);
  };

  readonly mostrarPaciente = (paciente: PacienteAdicional): string => {
    return [
      paciente.apellido_paterno,
      paciente.apellido_materno,
      paciente.nombres
    ].join(' ') + ` - HC: ${paciente.historia_clinica} - DNI: ${paciente.dni}`;
  };

  seleccionarPaciente(paciente: PacienteAdicional): void {
    this.pacienteSeleccionado.set(paciente);
    this.pacienteConsultado.set(null);
  }

  limpiarPaciente(): void {
    this.pacienteSeleccionado.set(null);
    this.pacienteConsultado.set(null);
    this.pacienteControl.setValue(null, { emitEvent: false });
  }
  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }
  consultarPaciente(): void {
    const paciente = this.pacienteSeleccionado();

    if (!paciente) return;

    this.pacienteConsultado.set(paciente);
  }


readonly consultorios = signal<SelectOption[]>([
    { value: 1, label: 'MEDICINA GENERAL' },
    { value: 2, label: 'CARDIOLOGÍA' },
    { value: 3, label: 'TRAUMATOLOGÍA' },
    { value: 4, label: 'NEUROLOGÍA' }
  ]);

  readonly actividadesMedicas = signal<SelectOption[]>([
    { value: 1, label: 'CONSULTA MÉDICA' },
    { value: 2, label: 'PROCEDIMIENTOS' },
    { value: 3, label: 'INTERCONSULTA' }
  ]);

  readonly consultorioForm = this.fb.group({
    consultorio: [null as number | null, Validators.required],
    actividad_medica: [null as number | null, Validators.required]
  });

  consultarProgramacion(): void {
    const paciente = this.pacienteConsultado();

    if (!paciente) return;
    if (this.consultorioForm.invalid) {
      this.consultorioForm.markAllAsTouched();
      return;
    }

    this.modalProgramacion()?.abrir();
  }

  readonly datosPaciente = computed<PatientSummaryData | null>(() => {
    const paciente = this.pacienteConsultado();

    if (!paciente) return null;

    return {
      paciente: [
        paciente.apellido_paterno,
        paciente.apellido_materno,
        paciente.nombres
      ].join(' '),
      historia: paciente.historia_clinica,
      dni: paciente.dni,
      edad: 74,
      sexo: 'M',
      grupo_sanguineo: 'O+',
      nombre_titular: 'TITULAR DE PRUEBA'
    };
  });

  get nombreConsultorio(): string {
    const codigo = this.consultorioForm.controls.consultorio.value;

    return this.consultorios().find(
      item => item.value === codigo
    )?.label ?? '';
  }

  get nombreActividadMedica(): string {
    const codigo = this.consultorioForm.controls.actividad_medica.value;

    return this.actividadesMedicas().find(
      item => item.value === codigo
    )?.label ?? '';
  }
}
