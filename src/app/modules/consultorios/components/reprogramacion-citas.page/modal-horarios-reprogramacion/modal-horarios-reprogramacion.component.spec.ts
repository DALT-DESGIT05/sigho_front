import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalHorariosReprogramacionComponent  } from './modal-horarios-reprogramacion.component';

describe('ModalHorariosReprogramacion', () => {
  let component: ModalHorariosReprogramacionComponent ;
  let fixture: ComponentFixture<ModalHorariosReprogramacionComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHorariosReprogramacionComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHorariosReprogramacionComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
