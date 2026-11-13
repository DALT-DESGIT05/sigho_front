import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { vi } from 'vitest';
import { ModalProgramacionAdicionalComponent } from './modal-programacion-adicional.component';

describe('ModalProgramacionAdicional', () => {
  let component: ModalProgramacionAdicionalComponent;
  let fixture: ComponentFixture<ModalProgramacionAdicionalComponent>;
  const ocultar_modal = vi.fn();
  const mostrar_modal = vi.fn(() => ({ hide: ocultar_modal }));

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ModalProgramacionAdicionalComponent],
      providers: [{ provide: BsModalService, useValue: { show: mostrar_modal } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalProgramacionAdicionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the programming modal and keeps it open when requesting schedules', () => {
    const emitir_programacion = vi.fn();
    component.programacionSeleccionada.subscribe(emitir_programacion);
    component.abrir();

    expect(mostrar_modal).toHaveBeenCalledOnce();
    expect(component.modal()?.resolvedTitle()).toBe('Programaciones Médicas Disponibles');
    expect(component.modal()?.size()).toBe('xl');

    const programacion = component.programaciones()[0];
    component.onAccionProgramacion({ action: 'ver_horarios', row: programacion });

    expect(emitir_programacion).toHaveBeenCalledWith(programacion);
    expect(ocultar_modal).not.toHaveBeenCalled();
  });
});
