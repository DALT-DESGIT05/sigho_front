import { Component, computed, inject, signal } from '@angular/core';
import { ProgramacionPersonalApi } from '../../../../interfaces/personal/programacion-personal.interface';
import { ProgramacionPersonalService } from '../../../../services/personal/programacion-personal.service';

@Component({
  selector: 'app-mi-horario',
  imports: [],
  templateUrl: './mi-horario.component.html',
  styleUrl: './mi-horario.component.scss',
})
export class MiHorarioComponent {
  private readonly programacionService = inject(ProgramacionPersonalService);
  readonly programaciones = signal<ProgramacionPersonalApi[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly persona = computed(() => this.programaciones()[0] ?? null);
  readonly horas = computed(() => this.programaciones().reduce(
    (total, item) => total + (item.turno_hora_duracion ?? 0),
    0,
  ));

  constructor() {
    this.programacionService.listar(this.periodoActual()).subscribe({
      next: ({ data }) => this.programaciones.set(data),
      error: () => {
        this.error.set('No se pudo cargar el horario del personal.');
        this.cargando.set(false);
      },
      complete: () => this.cargando.set(false),
    });
  }

  nombrePersona(): string {
    const persona = this.persona();
    if (!persona) return 'Personal autenticado';

    return [persona.person_nom, persona.person_ape_pat, persona.person_ape_mat]
      .filter(Boolean)
      .join(' ');
  }

  inicialesPersona(): string {
    return this.nombrePersona()
      .split(' ')
      .filter(Boolean)
      .map((parte) => parte[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  dia(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', { weekday: 'short', timeZone: 'UTC' }).format(this.fecha(fecha));
  }

  numero(fecha: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', timeZone: 'UTC' }).format(this.fecha(fecha));
  }

  mesActual(): string {
    return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date());
  }

  especialidadPersona(): string {
    return this.persona()?.des_consul || 'Sin especialidad';
  }

  descripcionPersona(): string {
    return this.persona()?.des_consul || 'Programación de personal';
  }

  hora(valor: string): string {
    return valor.match(/\d{2}:\d{2}/)?.[0] ?? valor;
  }

  private periodoActual(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }

  private fecha(valor: string): Date {
    const normalizado = valor.includes('T') ? valor : valor.replace(' ', 'T');
    return new Date(normalizado.endsWith('Z') ? normalizado : `${normalizado}Z`);
  }
}
