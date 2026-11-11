import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalProgramacionAdicionalComponent } from './modal-programacion-adicional.component';

describe('ModalProgramacionAdicional', () => {
  let component: ModalProgramacionAdicionalComponent;
  let fixture: ComponentFixture<ModalProgramacionAdicionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalProgramacionAdicionalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalProgramacionAdicionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
