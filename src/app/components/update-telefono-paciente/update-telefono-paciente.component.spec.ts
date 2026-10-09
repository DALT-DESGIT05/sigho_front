import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsuarioService } from '../../services/auth/usuario.service';

import { UpdateTelefonoPacienteComponent } from './update-telefono-paciente.component';

describe('UpdateTelefonoPacienteComponent', () => {
  let fixture: ComponentFixture<UpdateTelefonoPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UpdateTelefonoPacienteComponent], providers: [{ provide: UsuarioService, useValue: { change_telefono_paciente: () => of(null) } }] }).compileComponents();
    fixture = TestBed.createComponent(UpdateTelefonoPacienteComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});