import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { UsuarioService } from '../../services/auth/usuario.service';

import { UpdateCorreoPacienteComponent } from './update-correo-paciente.component';

describe('UpdateCorreoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateCorreoPacienteComponent>;
  const changeCorreo = vi.fn(() => NEVER);

  beforeEach(async () => {
    changeCorreo.mockClear();
    await TestBed.configureTestingModule({ imports: [UpdateCorreoPacienteComponent], providers: [{ provide: UsuarioService, useValue: { change_correo_paciente: changeCorreo } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateCorreoPacienteComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('validates and synchronizes the email field with its Signal Form model', () => {
    fixture.componentRef.setInput('input_correo', 'correo-invalido');
    fixture.componentRef.setInput('input_dni', '12345678');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.correo_model()).toEqual({ correo: 'correo-invalido' });
    expect(component.correo_form().valid()).toBe(false);

    component.correo_form.correo().value.set('paciente@fap.mil.pe');

    expect(component.correo_model().correo).toBe('paciente@fap.mil.pe');
    expect(component.correo_form().valid()).toBe(true);
  });

  it('does not submit invalid data and submits the valid Signal Form model', () => {
    const component = fixture.componentInstance;
    component.formulario.dni = '12345678';
    component.btn_save();
    expect(changeCorreo).not.toHaveBeenCalled();

    component.correo_model.set({ correo: 'paciente@fap.mil.pe' });
    component.action_save();
    expect(changeCorreo).toHaveBeenCalledWith('12345678', 'paciente@fap.mil.pe');
  });
});
