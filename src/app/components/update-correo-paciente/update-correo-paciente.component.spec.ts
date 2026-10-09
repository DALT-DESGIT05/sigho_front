import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuarioService } from '../../services/auth/usuario.service';

import { UpdateCorreoPacienteComponent } from './update-correo-paciente.component';

describe('UpdateCorreoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateCorreoPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UpdateCorreoPacienteComponent], providers: [{ provide: UsuarioService, useValue: { change_correo_paciente: () => of(null) } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateCorreoPacienteComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});