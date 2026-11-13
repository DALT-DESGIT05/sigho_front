import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { vi } from 'vitest';
import { ModalHorariosAdicionalComponent } from './modal-horarios-adicional.component';

describe('ModalHorariosAdicional', () => {
  let component: ModalHorariosAdicionalComponent;
  let fixture: ComponentFixture<ModalHorariosAdicionalComponent>;
  const ocultar_modal = vi.fn();
  const mostrar_modal = vi.fn(() => ({ hide: ocultar_modal }));

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ModalHorariosAdicionalComponent],
      providers: [{ provide: BsModalService, useValue: { show: mostrar_modal } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHorariosAdicionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens with visual separation and closes its own modal reference', () => {
    component.abrir();

    expect(mostrar_modal).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ class: expect.stringContaining('app-modal--separated') })
    );

    component.cerrar();

    expect(ocultar_modal).toHaveBeenCalledOnce();
  });
});
