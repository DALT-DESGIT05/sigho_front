import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProgramacionPersonalApi } from '../../../../interfaces/personal/programacion-personal.interface';
import { ProgramacionPersonalService } from '../../../../services/personal/programacion-personal.service';
import { MiHorarioComponent } from './mi-horario.component';

describe('MiHorarioComponent', () => {
  let fixture: ComponentFixture<MiHorarioComponent>;
  let component: MiHorarioComponent;

  const programaciones: ProgramacionPersonalApi[] = [
    {
      id_prog_per: 10,
      id_persona_personal: 4,
      id_horario: 2,
      id_horario_turno: 1,
      id_especialidad: 13,
      hor_fecha: '2026-10-26 00:00:00',
      hor_hora: 8,
      hor_obs: null,
      nro_consul: '101',
      cant_cupos: 10,
      intervalos: 30,
      canti_adi: 0,
      turno_hora_inicio: '2026-10-26 07:00:00',
      turno_hora_fin: '2026-10-26 13:00:00',
      turno_hora_duracion: 6,
      turno_desc: 'Mañana',
      des_consul: 'Medicina Interna',
      person_nom: 'Mariana',
      person_ape_pat: 'Torres',
      person_ape_mat: 'Salazar',
      id_tipo_personal: 1,
      nsa: '123456',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiHorarioComponent],
      providers: [
        {
          provide: ProgramacionPersonalService,
          useValue: { listar: () => of({ data: programaciones }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows programming returned by the API', () => {
    expect(component.programaciones()).toEqual(programaciones);
    expect(fixture.nativeElement.querySelectorAll('.agenda-item').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Mariana Torres Salazar');
  });

  it('sums the duration returned by the API', () => {
    expect(component.horas()).toBe(6);
  });
});
