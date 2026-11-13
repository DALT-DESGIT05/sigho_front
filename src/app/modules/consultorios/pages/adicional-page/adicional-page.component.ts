
import { Component, signal,computed, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { AutoCompleteComponent } from '../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { PatientSummaryComponent,PatientSummaryData } from '../../../../components/patient-summary/patient-summary.component';
import { ModalProgramacionAdicionalComponent, ProgramacionAdicional } from '../../components/adicional-page/modal-programacion-adicional/modal-programacion-adicional.component';
import { ModalHorariosAdicionalComponent } from '../../components/adicional-page/modal-horarios-adicional/modal-horarios-adicional.component';
import { Horario_grid_item } from '../../../../interfaces/citas/horario-grid.interface';
import { AlertDialogComponent } from '../../../../components/alert-dialog/alert-dialog.component';

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
            ReactiveFormsModule,CardGeneralComponent,AutoCompleteComponent,ButtonComponent,PatientSummaryComponent,SelectComponent,ModalProgramacionAdicionalComponent,
            ModalHorariosAdicionalComponent,AlertDialogComponent
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
  readonly modalHorarios =viewChild<ModalHorariosAdicionalComponent>('modalHorarios');
  readonly programacionSeleccionada =signal<ProgramacionAdicional | null>(null);
  readonly horariosDisponibles =signal<Horario_grid_item[]>([]);
  readonly registrandoCita = signal(false);
  readonly horaCargando = signal('');
  readonly alertDialog = viewChild<AlertDialogComponent>('alertDialog');

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

  private generarHorariosMock(programacion: ProgramacionAdicional): Horario_grid_item[] {
    const horarios: Horario_grid_item[] = [];
    const [horas, minutos] = programacion.hora_inicio.split(':').map(Number);
    const inicio = horas * 60 + minutos;

    for (let i = 0; i < programacion.cupos; i++) {
      const totalMinutos = inicio + i * 20;
      const hora = Math.floor(totalMinutos / 60);
      const minuto = totalMinutos % 60;

      horarios.push({
        hora: `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`,
        disponible: !(
          programacion.id_programacion === 2 && (i === 0 || i === 5)
        )
      });
    }

    return horarios;
  }

  abrirHorarios(programacion: ProgramacionAdicional): void {
    this.programacionSeleccionada.set(programacion);
    this.horariosDisponibles.set(this.generarHorariosMock(programacion));
    this.modalHorarios()?.abrir();
  }

  async registrarCitaAdicional(horario: Horario_grid_item): Promise<void> {

    if (this.registrandoCita() || !horario.disponible) {
      return;
    }

    const programacion = this.programacionSeleccionada();

    if (!programacion) {
      return;
    }

    this.registrandoCita.set(true);
    this.horaCargando.set(horario.hora);

    // SIMULACIÓN: posteriormente se registrará mediante el backend.
    this.registrandoCita.set(false);
    this.horaCargando.set('');

    this.modalHorarios()?.cerrar();
    this.modalProgramacion()?.cerrar();

    await this.alertDialog()?.open({
      tipo: 'success',
      diseno: 'centrado',
      titulo: 'Citas Adicionales',
      mensaje: 'La cita adicional fue registrada con éxito.',
      imagen: 'icono_de_aceptacion',
      texto_confirmar: 'OK',
      color_confirmar: 'primary',
      mostrar_cancelar: false,
      cerrar_fuera: false,
      cerrar_escape: false
    });
  }

}
