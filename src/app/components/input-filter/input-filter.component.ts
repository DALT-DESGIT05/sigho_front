import { Component, input, output } from '@angular/core';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

@Component({
  selector: 'app-input-filter',
  standalone: true,
  imports: [],
  templateUrl: './input-filter.component.html',
  styleUrl: './input-filter.component.scss'
})
export class InputFilterComponent {


  readonly placeholder = input('Buscar...');


  readonly value = input('');


  readonly size = input<ComponentSize>('md');


  readonly color = input<PaletteColor>('primary');


  readonly icon = input('fa-solid fa-magnifying-glass');


  readonly disabled = input(false);


  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.valueChange.emit(inputElement.value);
  }
}
