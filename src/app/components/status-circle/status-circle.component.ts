import { Component, input } from '@angular/core';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

@Component({
  selector: 'app-status-circle',
  standalone: true,
  templateUrl: './status-circle.component.html',
  styleUrl: './status-circle.component.scss'
})
export class StatusCircleComponent {
  readonly clases = input.required<PaletteColor>();
  readonly title = input('');
  readonly size = input<ComponentSize>('md');
}
