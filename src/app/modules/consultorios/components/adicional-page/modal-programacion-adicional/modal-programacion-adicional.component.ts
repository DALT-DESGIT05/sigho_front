
import { ChangeDetectionStrategy,Component,computed, input,output, signal, TemplateRef, viewChild} from '@angular/core';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { TableColumn, TableRowAction,TableActionEvent } from '../../../../../interfaces/util.interface';
import { TableComponent } from '../../../../../components/table/table.component';
import { CardResumenItemComponent } from '../../../../../components/card-resumen-item/card-resumen-item.component';
import { ButtonComponent } from '../../../../../components/button/button.component';


export interface ProgramacionAdicional {
  id_programacion: number;
  codigo_medico: string;
  nombre_medico: string;
  fecha: string;
  turno: string;
  hora_inicio: string;
  hora_termino: string;
  horario: string;
  cupos: number;
  reservados: number;
  disponibles: number;
}

@Component({
  selector: 'app-modal-programacion-adicional',
  standalone: true,
  imports: [ModalComponent,TableComponent,CardResumenItemComponent,ButtonComponent],
  templateUrl: './modal-programacion-adicional.component.html',
  styleUrl: './modal-programacion-adicional.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalProgramacionAdicionalComponent {

  // MODAL REUTILIZABLE
  readonly modal = viewChild<ModalComponent>('modalProgramacion');

  // DATOS RECIBIDOS DEL COMPONENTE PADRE
  readonly consultorio = input<string>('');
  readonly actividadMedica = input<string>('');

  // EVENTO PARA ENVIAR LA PROGRAMACIÓN SELECCIONADA
  readonly programacionSeleccionada = output<ProgramacionAdicional>();


  // DATOS FICTICIOS
  readonly programaciones = signal<ProgramacionAdicional[]>([
    {
      id_programacion: 1,
      codigo_medico: 'MED001',
      nombre_medico: 'Dr. CARCAMO ALFARO Luis',
      fecha: '11/11/2026',
      turno: 'MAÑANA',
      hora_inicio: '08:00',
      hora_termino: '14:00',
      cupos: 18,
      reservados: 0,
      disponibles: 18,
      horario: '08:00 – 14:00'
    },
    {
      id_programacion: 2,
      codigo_medico: 'MED002',
      nombre_medico: 'Dr. CCOPA TITO Edgar',
      fecha: '11/11/2026',
      turno: 'MAÑANA',
      hora_inicio: '08:00',
      hora_termino: '14:00',
      cupos: 18,
      reservados: 1,
      disponibles: 17,
      horario: '08:00 – 14:00'
    }
  ]);

  // TOTAL DE PROGRAMACIONES
  readonly totalProgramaciones = computed(
    () => this.programaciones().length
  );

  // ABRIR MODAL
  abrir(): void {
    this.modal()?.open();
  }

  // CERRAR MODAL
  cerrar(): void {
    this.modal()?.close();
  }

  // SELECCIONAR PROGRAMACIÓN
    seleccionarProgramacion(programacion: ProgramacionAdicional): void {
      if (programacion.disponibles <= 0) return;

      this.programacionSeleccionada.emit(programacion);
    }


readonly columnasProgramacion: TableColumn<ProgramacionAdicional>[] = [
  {
    key: 'nombre_medico',
    label: 'MÉDICO',
    image: 'assets/images/medico.png',
    imageSize: 36
  },
  {
    key: 'fecha',
    label: 'FECHA',
    align: 'center'
  },
    {
    key: 'turno',
    label: 'TURNO',
    align: 'center',
    badge: {
      texto: (_, row) => row.turno,
      clases: (_, row) =>
        row.turno === 'MAÑANA' ? 'warning' : 'info',
      icon: (_, row) =>
        row.turno === 'MAÑANA'
          ? 'fa-solid fa-sun'
          : 'fa-solid fa-moon',
      size: 'sm'
    }
  },
  {
    key: 'horario',
    label: 'HORARIO',
    align: 'center'
  },
  {
    key: 'cupos',
    label: 'CUPOS',
    align: 'center',
    badge: {
      texto: (_, row) => String(row.cupos),
      clases: 'primary',
      size: 'sm'
    }
  },
  {
    key: 'reservados',
    label: 'RESERVADOS',
    align: 'center',
    badge: {
      texto: (_, row) => String(row.reservados),
      clases: 'warning',
      size: 'sm'
    }
  },
  {
    key: 'disponibles',
    label: 'DISPONIBLES',
    align: 'center',
    badge: {
      texto: (_, row) => String(row.disponibles),
      clases: 'success',
      size: 'sm'
    }
  }
];


  readonly accionesProgramacion: TableRowAction<ProgramacionAdicional>[] = [
    {
      id: 'ver_horarios',
      icon: 'fa-regular fa-calendar-days',
      color: 'primary',
      variant: 'outline',
      iconOnly: false,
      disabled: (row) => row.disponibles <= 0
    }
  ];

  onAccionProgramacion(event: TableActionEvent<ProgramacionAdicional>): void {
    if (event.action === 'ver_horarios') {this.seleccionarProgramacion(event.row);
    }
  }

}
