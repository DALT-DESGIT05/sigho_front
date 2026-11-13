import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdicionalPageComponent } from './adicional-page.component';

describe('AdicionalPage', () => {
  let component: AdicionalPageComponent;
  let fixture: ComponentFixture<AdicionalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionalPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdicionalPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
