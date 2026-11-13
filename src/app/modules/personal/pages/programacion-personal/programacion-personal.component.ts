import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { ButtonComponent } from '../../../../components/button/button.component';
import { InputDateComponent } from '../../../../components/input-date/input-date.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { DiaCalendario, ProgramacionHorario, TurnoHorario } from '../../../../interfaces/personal/horario.interface';
import { HorarioMockService } from '../../../../services/personal/horario-mock.service';

interface CeldaSeleccionada { personalId: number; fecha: string; }

@Component({
  selector: 'app-programacion-personal',
  imports: [ButtonComponent, InputDateComponent, InputTextComponent, ModalComponent, SelectComponent],
  templateUrl: './programacion-personal.component.html',
  styleUrl: './programacion-personal.component.scss',
})
export class ProgramacionPersonalComponent {
  readonly horarioService = inject(HorarioMockService);
  private readonly asignacionModal = viewChild.required<ModalComponent>('asignacionModal');
  readonly filtros_model = signal({ periodo: this.periodoActual(), busqueda: '', area: '', tipo: '' });
  readonly filtros_form = form(this.filtros_model);
  readonly asignacion_model = signal<{ turnoId: number | null; observacion: string }>({ turnoId: 1, observacion: '' });
  readonly asignacion_form = form(this.asignacion_model, (schema) => required(schema.turnoId));
  private readonly filtros = computed(() => this.filtros_model());
  readonly celdaSeleccionada = signal<CeldaSeleccionada | null>(null);
  readonly aviso = signal('');

  constructor() {
    this.horarioService.cargarTurnos().subscribe();
    this.horarioService.cargarPersonal().subscribe();
    this.horarioService.cargarMatriz(this.periodoActual()).subscribe();
  }

  actualizarPeriodo(valor: string | Date | number | null | undefined): void {
    const periodo = typeof valor === 'string' ? valor : String(valor ?? '');
    this.filtros_model.update((filtros) => ({ ...filtros, periodo }));
    if (/^\d{4}-\d{2}$/.test(periodo)) {
      this.horarioService.cargarMatriz(periodo).subscribe();
    }
  }

  actualizarBusqueda(valor: string | number | null | undefined): void {
    this.filtros_model.update((filtros) => ({ ...filtros, busqueda: String(valor ?? '') }));
  }

  actualizarFiltro(campo: 'area' | 'tipo', valor: string | number | null): void {
    this.filtros_model.update((filtros) => ({ ...filtros, [campo]: String(valor ?? '') }));
  }

  actualizarTurno(valor: string | number | null): void {
    this.asignacion_model.update((asignacion) => ({ ...asignacion, turnoId: valor === null ? null : Number(valor) }));
  }

  actualizarObservacion(valor: string | number | null | undefined): void {
    this.asignacion_model.update((asignacion) => ({ ...asignacion, observacion: String(valor ?? '') }));
  }
  readonly areaOptions: SelectOption[] = [
    { value: '', label: 'Todas las áreas' }, { value: 'Emergencia', label: 'Emergencia' }, { value: 'Hospitalización', label: 'Hospitalización' },
    { value: 'Laboratorio', label: 'Laboratorio' }, { value: 'Admisión', label: 'Admisión' },
  ];
  readonly tipoOptions: SelectOption[] = [
    { value: '', label: 'Todos los tipos' }, { value: 'Médico', label: 'Médico' }, { value: 'Enfermería', label: 'Enfermería' },
    { value: 'Técnico', label: 'Técnico' }, { value: 'Administrativo', label: 'Administrativo' },
  ];
  readonly turnoOptions = computed<SelectOption[]>(() => this.horarioService.turnos().filter((turno) => turno.activo).map((turno) => ({ value: turno.id, label: turno.nombre, detail: `${turno.horaInicio} - ${turno.horaFin}` })));
  private readonly programacionesPorCelda = computed(() => new Map(this.horarioService.programaciones().map((item) => [this.claveCelda(item.personalId, item.fecha), item])));
  private readonly turnosPorId = computed(() => new Map(this.horarioService.turnos().map((item) => [item.id, item])));
  readonly dias = computed<DiaCalendario[]>(() => {
    const periodo = this.filtros().periodo;
    if (!/^\d{4}-\d{2}$/.test(periodo)) return [];
    const [year, month] = periodo.split('-').map(Number);
    const cantidad = new Date(year, month, 0).getDate();
    const hoy = this.isoDate(new Date());
    return Array.from({ length: cantidad }, (_, indice) => {
      const fecha = new Date(year, month - 1, indice + 1); const iso = this.isoDate(fecha); const diaSemana = fecha.getDay();
      return { fecha: iso, numero: indice + 1, nombreCorto: new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(fecha).replace('.', ''), esFinDeSemana: diaSemana === 0 || diaSemana === 6, esHoy: iso === hoy };
    });
  });
  readonly personalFiltrado = computed(() => {
    const filtros = this.filtros(); const busqueda = filtros.busqueda.trim().toLocaleLowerCase('es');
    return this.horarioService.personal().filter((persona) => (!filtros.area || persona.area === filtros.area) && (!filtros.tipo || persona.tipo === filtros.tipo) && (!busqueda || `${persona.nombreCompleto} ${persona.cargo}`.toLocaleLowerCase('es').includes(busqueda)));
  });
  readonly totalBorradores = computed(() => this.horarioService.programaciones().filter((item) => item.estado === 'BORRADOR' && item.fecha.startsWith(this.filtros().periodo)).length);
  readonly horasPlanificadas = computed(() => this.horarioService.programaciones().filter((item) => item.fecha.startsWith(this.filtros().periodo) && item.estado !== 'CANCELADO').reduce((total, item) => total + (this.turno(item.turnoId)?.horas ?? 0), 0));
  programacion(personalId: number, fecha: string): ProgramacionHorario | undefined { return this.programacionesPorCelda().get(this.claveCelda(personalId, fecha)); }
  turno(turnoId: number): TurnoHorario | undefined { return this.turnosPorId().get(turnoId); }
  claseCelda(dia: DiaCalendario, asignacion: ProgramacionHorario | undefined, turnoAsignado: TurnoHorario | undefined): string { const clases = ['shift-cell']; if (!turnoAsignado) clases.push('empty'); else clases.push(`tone-${turnoAsignado.tono}`); if (dia.esFinDeSemana) clases.push('weekend'); if (asignacion?.estado === 'BORRADOR') clases.push('draft'); return clases.join(' '); }
  abrirAsignacion(personalId: number, fecha: string): void { const existente = this.programacion(personalId, fecha); this.celdaSeleccionada.set({ personalId, fecha }); this.asignacion_model.set({ turnoId: existente?.turnoId ?? 1, observacion: existente?.observacion ?? '' }); this.asignacionModal().open(); }
  guardarAsignacion(): void { const celda = this.celdaSeleccionada(); if (!celda || !this.asignacion_form().valid()) return; const valores = this.asignacion_model(); if (valores.turnoId === null) return; this.horarioService.guardarProgramacion(celda.personalId, celda.fecha, valores.turnoId, valores.observacion); this.aviso.set('Asignación guardada como borrador en esta demostración.'); this.asignacionModal().close(); }
  publicar(): void { const periodo = this.filtros().periodo; if (!periodo) return; this.horarioService.publicarBorradores(periodo); this.aviso.set('La programación mock del período fue publicada correctamente.'); }
  limpiarFiltros(): void { this.filtros_model.set({ periodo: this.periodoActual(), busqueda: '', area: '', tipo: '' }); }
  personaSeleccionada(): string { const personalId = this.celdaSeleccionada()?.personalId; return this.horarioService.personal().find((item) => item.id === personalId)?.nombreCompleto ?? ''; }
  fechaSeleccionada(): string { const fecha = this.celdaSeleccionada()?.fecha; return fecha ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${fecha}T12:00:00Z`)) : ''; }
  private claveCelda(personalId: number, fecha: string): string { return `${personalId}|${fecha}`; }
  private periodoActual(): string { const hoy = new Date(); return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`; }
  private isoDate(fecha: Date): string { return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`; }
}
