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

  /** Texto mostrado cuando el campo está vacío. */
  readonly placeholder = input('Buscar...');

  /** Valor actual del filtro. */
  readonly value = input('');

  /** Tamaño del componente. */
  readonly size = input<ComponentSize>('md');

  /** Color institucional. */
  readonly color = input<PaletteColor>('primary');

  /** Ícono configurable. */
  readonly icon = input('fa-solid fa-magnifying-glass');

  /** Permite deshabilitar el buscador. */
  readonly disabled = input(false);

  /** Emite el texto ingresado al componente padre. */
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.valueChange.emit(inputElement.value);
  }
}
