import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { PacienteService } from '../../services/emergencia/paciente.service';

import { UpdateTelefonoPacienteComponent } from './update-telefono-paciente.component';

describe('UpdateTelefonoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateTelefonoPacienteComponent>;
  const actualizarContacto = vi.fn(() => NEVER);

  beforeEach(async () => {
    actualizarContacto.mockClear();
    await TestBed.configureTestingModule({ imports: [UpdateTelefonoPacienteComponent], providers: [{ provide: PacienteService, useValue: { actualizarContacto } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateTelefonoPacienteComponent);
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('validates and synchronizes the phone field with its Signal Form model', () => {
    const component = fixture.componentInstance;
    component.abrir('', 123, 'paciente@fap.mil.pe');

    expect(component.telefono_model()).toEqual({ telefono: '' });
    expect(component.telefono_form().valid()).toBe(false);

    component.telefono_form.telefono().value.set('999888777');

    expect(component.telefono_model().telefono).toBe('999888777');
    expect(component.telefono_form().valid()).toBe(true);
  });

  it('does not submit an empty phone and submits the valid Signal Form model', () => {
    const component = fixture.componentInstance;
    component.abrir('', 123, 'paciente@fap.mil.pe');
    component.btn_save();
    expect(actualizarContacto).not.toHaveBeenCalled();

    component.telefono_model.set({ telefono: '999888777' });
    component.action_save();
    expect(actualizarContacto).toHaveBeenCalledWith({
      persona_id: 123,
      celular: '999888777',
      correo_electronico: 'paciente@fap.mil.pe',
    });
  });
});
