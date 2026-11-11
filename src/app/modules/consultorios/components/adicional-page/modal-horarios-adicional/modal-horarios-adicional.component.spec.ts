import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalHorariosAdicionalComponent } from './modal-horarios-adicional.component';

describe('ModalHorariosAdicional', () => {
  let component: ModalHorariosAdicionalComponent;
  let fixture: ComponentFixture<ModalHorariosAdicionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHorariosAdicionalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHorariosAdicionalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
