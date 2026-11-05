import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservaCitasPageComponent } from './reserva-citas-page.component';

describe('ReservaCitasPageComponent', () => {
  let component: ReservaCitasPageComponent;
  let fixture: ComponentFixture<ReservaCitasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaCitasPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaCitasPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
