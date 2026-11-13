import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepperComponent] }).compileComponents();
    fixture = TestBed.createComponent(StepperComponent);
    fixture.componentRef.setInput('steps', [
      { label: 'Datos generales' },
      { label: 'Confirmación' },
    ]);
  });

  it('renders every step and marks the current one', () => {
    fixture.componentRef.setInput('currentStep', 1);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const steps = element.querySelectorAll('.app-stepper__step');

    expect(steps).toHaveLength(2);
    expect(steps[0].classList).toContain('app-stepper__step--active');
    expect(steps[0].getAttribute('aria-current')).toBe('step');
    expect(element.textContent).toContain('Datos generales');
    expect(element.textContent).toContain('Confirmación');
  });

  it('marks previous steps as completed', () => {
    fixture.componentRef.setInput('currentStep', 2);
    fixture.detectChanges();

    const steps = (fixture.nativeElement as HTMLElement).querySelectorAll('.app-stepper__step');

    expect(steps[0].classList).toContain('app-stepper__step--completed');
    expect(steps[1].classList).toContain('app-stepper__step--active');
  });
});
