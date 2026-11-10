import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { PacienteService } from '../../services/emergencia/paciente.service';

import { UpdateCorreoPacienteComponent } from './update-correo-paciente.component';

describe('UpdateCorreoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateCorreoPacienteComponent>;
  const actualizarContacto = vi.fn(() => NEVER);

  beforeEach(async () => {
    actualizarContacto.mockClear();
    await TestBed.configureTestingModule({ imports: [UpdateCorreoPacienteComponent], providers: [{ provide: PacienteService, useValue: { actualizarContacto } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateCorreoPacienteComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('validates and synchronizes the email field with its Signal Form model', () => {
    const component = fixture.componentInstance;
    component.abrir('correo-invalido', 123, '999888777');

    expect(component.correo_model()).toEqual({ correo: 'correo-invalido' });
    expect(component.correo_form().valid()).toBe(false);

    component.correo_form.correo().value.set('paciente@fap.mil.pe');

    expect(component.correo_model().correo).toBe('paciente@fap.mil.pe');
    expect(component.correo_form().valid()).toBe(true);
  });

  it('does not submit invalid data and submits the valid Signal Form model', () => {
    const component = fixture.componentInstance;
    component.abrir('', 123, '999888777');
    component.btn_save();
    expect(actualizarContacto).not.toHaveBeenCalled();

    component.correo_model.set({ correo: 'paciente@fap.mil.pe' });
    component.action_save();
    expect(actualizarContacto).toHaveBeenCalledWith({
      persona_id: 123,
      celular: '999888777',
      correo_electronico: 'paciente@fap.mil.pe',
    });
  });
});
