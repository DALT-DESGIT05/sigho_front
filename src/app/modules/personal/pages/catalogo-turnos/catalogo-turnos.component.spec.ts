import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoTurnosComponent } from './catalogo-turnos.component';

describe('CatalogoTurnosComponent', () => {
  let fixture: ComponentFixture<CatalogoTurnosComponent>;
  let component: CatalogoTurnosComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CatalogoTurnosComponent] }).compileComponents();

    fixture = TestBed.createComponent(CatalogoTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('binds the catalog form through Signal Forms', () => {
    component.actualizarTexto('codigo', 'MAT');

    expect(component.turno_model().codigo).toBe('MAT');
  });

  it('keeps validation before saving a turno', () => {
    component.turno_model.set({ codigo: 'MATUTINO', nombre: '', horaInicio: '07:00', horaFin: '13:00', horas: 6, tono: 'manana' });

    component.guardarTurno();

    expect(component.horarioService.turnos()).toHaveLength(5);
  });

  it('saves the existing turno payload and uppercases its code', () => {
    component.turno_model.set({ codigo: 'mat', nombre: 'Mañana corta', horaInicio: '07:00', horaFin: '10:00', horas: 3, tono: 'manana' });

    component.guardarTurno();

    expect(component.horarioService.turnos().at(-1)).toMatchObject({
      codigo: 'MAT', nombre: 'Mañana corta', horaInicio: '07:00', horaFin: '10:00', horas: 3, tono: 'manana', activo: true,
    });
  });
});
