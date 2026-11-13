import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { form, max, maxLength, min, required } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { InputDateComponent } from '../../../../components/input-date/input-date.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { TonoTurno, TurnoHorario } from '../../../../interfaces/personal/horario.interface';
import { HorarioMockService } from '../../../../services/personal/horario-mock.service';

@Component({
  selector: 'app-catalogo-turnos',
  imports: [ButtonComponent, InputDateComponent, InputTextComponent, ModalComponent, SelectComponent],
  templateUrl: './catalogo-turnos.component.html',
  styleUrl: './catalogo-turnos.component.scss',
})
export class CatalogoTurnosComponent {
  readonly horarioService = inject(HorarioMockService);
  private readonly turnoModal = viewChild.required<ModalComponent>('turnoModal');
  readonly turnoEditado = signal<number | null>(null);
  readonly aviso = signal('');

  constructor() {
    this.horarioService.cargarTurnos().subscribe();
  }

  readonly turno_model = signal({
    codigo: '',
    nombre: '',
    horaInicio: '07:00',
    horaFin: '13:00',
    horas: 6,
    tono: 'manana',
  });
  readonly turno_form = form(this.turno_model, (schema) => {
    required(schema.codigo);
    maxLength(schema.codigo, 3);
    required(schema.nombre);
    required(schema.horaInicio);
    required(schema.horaFin);
    required(schema.horas);
    min(schema.horas, 0);
    max(schema.horas, 24);
    required(schema.tono);
  });
  readonly tonoOptions: SelectOption[] = [
    { value: 'manana', label: 'Celeste' },
    { value: 'tarde', label: 'Ámbar' },
    { value: 'noche', label: 'Violeta' },
    { value: 'guardia', label: 'Rojo' },
    { value: 'descanso', label: 'Gris' },
  ];
  readonly turnosActivos = computed(() => this.horarioService.turnos().filter((turno) => turno.activo).length);

  actualizarTexto(campo: 'codigo' | 'nombre', valor: string | number | null | undefined): void {
    this.turno_model.update((turno) => ({ ...turno, [campo]: String(valor ?? '') }));
  }

  actualizarHora(campo: 'horaInicio' | 'horaFin', valor: string | Date | number | null | undefined): void {
    this.turno_model.update((turno) => ({ ...turno, [campo]: typeof valor === 'string' ? valor : String(valor ?? '') }));
  }

  actualizarHoras(valor: string | number | null | undefined): void {
    this.turno_model.update((turno) => ({ ...turno, horas: valor === null || valor === undefined || valor === '' ? 0 : Number(valor) }));
  }

  actualizarTono(valor: string | number | null): void {
    this.turno_model.update((turno) => ({ ...turno, tono: String(valor ?? '') }));
  }

  nuevoTurno(): void {
    this.turnoEditado.set(null);
    this.turno_model.set({ codigo: '', nombre: '', horaInicio: '07:00', horaFin: '13:00', horas: 6, tono: 'manana' });
    this.turnoModal().open();
  }

  editarTurno(turno: TurnoHorario): void {
    this.turnoEditado.set(turno.id);
    this.turno_model.set({
      codigo: turno.codigo,
      nombre: turno.nombre,
      horaInicio: turno.horaInicio === '--:--' ? '00:00' : turno.horaInicio,
      horaFin: turno.horaFin === '--:--' ? '00:00' : turno.horaFin,
      horas: turno.horas,
      tono: turno.tono,
    });
    this.turnoModal().open();
  }

  guardarTurno(): void {
    if (!this.turno_form().valid()) {
      this.turno_form.codigo().markAsTouched();
      this.turno_form.nombre().markAsTouched();
      this.turno_form.horaInicio().markAsTouched();
      this.turno_form.horaFin().markAsTouched();
      this.turno_form.horas().markAsTouched();
      this.turno_form.tono().markAsTouched();
      return;
    }
    const valor = this.turno_model();
    this.horarioService.guardarTurno({
      id: this.turnoEditado() ?? undefined,
      codigo: valor.codigo.toUpperCase(),
      nombre: valor.nombre,
      horaInicio: valor.horaInicio,
      horaFin: valor.horaFin,
      horas: Number(valor.horas),
      tono: valor.tono as TonoTurno,
      activo: true,
    });
    this.aviso.set(this.turnoEditado() ? 'Turno mock actualizado.' : 'Turno mock creado.');
    this.turnoModal().close();
  }
}
