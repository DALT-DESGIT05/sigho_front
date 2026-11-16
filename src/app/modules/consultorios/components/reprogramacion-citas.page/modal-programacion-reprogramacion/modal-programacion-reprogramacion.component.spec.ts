import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalProgramacionReprogramacionComponent } from './modal-programacion-reprogramacion.component';

describe('ModalProgramacionReprogramacion', () => {
  let component: ModalProgramacionReprogramacionComponent;
  let fixture: ComponentFixture<ModalProgramacionReprogramacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalProgramacionReprogramacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalProgramacionReprogramacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
