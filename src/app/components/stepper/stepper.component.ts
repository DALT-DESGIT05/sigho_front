import { Component, input } from '@angular/core';

export interface StepperStep {
  label: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})
export class StepperComponent {
  readonly steps = input.required<readonly StepperStep[]>();
  readonly currentStep = input(1);
  readonly ariaLabel = input('Progreso');
}
