import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input-group-disabled',
  standalone: true,
  imports: [],
  templateUrl: './input-group-disabled.component.html',
  styleUrl: './input-group-disabled.component.scss'
})
export class InputGroupDisabledComponent {
  readonly texto_label = input('');
  readonly texto_input = input('');
}
