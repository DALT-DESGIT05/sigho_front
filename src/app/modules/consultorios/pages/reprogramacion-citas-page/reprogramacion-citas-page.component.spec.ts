import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReprogramacionCitasPageComponent  } from './reprogramacion-citas-page.component';
describe('ReprogramacionCitasPage', () => {
  let component: ReprogramacionCitasPageComponent ;
  let fixture: ComponentFixture<ReprogramacionCitasPageComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReprogramacionCitasPageComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReprogramacionCitasPageComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
