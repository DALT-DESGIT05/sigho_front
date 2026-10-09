import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { UsuarioService } from '../../services/auth/usuario.service';

import { UpdateTelefonoPacienteComponent } from './update-telefono-paciente.component';

describe('UpdateTelefonoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateTelefonoPacienteComponent>;
  const changeTelefono = vi.fn(() => NEVER);

  beforeEach(async () => {
    changeTelefono.mockClear();
    await TestBed.configureTestingModule({ imports: [UpdateTelefonoPacienteComponent], providers: [{ provide: UsuarioService, useValue: { change_telefono_paciente: changeTelefono } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateTelefonoPacienteComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('validates and synchronizes the phone field with its Signal Form model', () => {
    fixture.componentRef.setInput('input_telefono', '');
    fixture.componentRef.setInput('input_dni', '12345678');
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.telefono_model()).toEqual({ telefono: '' });
    expect(component.telefono_form().valid()).toBe(false);

    component.telefono_form.telefono().value.set('999888777');

    expect(component.telefono_model().telefono).toBe('999888777');
    expect(component.telefono_form().valid()).toBe(true);
  });

  it('does not submit an empty phone and submits the valid Signal Form model', () => {
    const component = fixture.componentInstance;
    component.formulario.dni = '12345678';
    component.btn_save();
    expect(changeTelefono).not.toHaveBeenCalled();

    component.telefono_model.set({ telefono: '999888777' });
    component.action_save();
    expect(changeTelefono).toHaveBeenCalledWith('12345678', '999888777');
  });
});
