import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

let nextToggleId = 0;

@Component({
  selector: 'app-check-toggle',
  standalone: true,
  imports: [],
  templateUrl: './check-toggle.component.html',
  styleUrl: './check-toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckToggleComponent),
      multi: true,
    },
  ],
})
export class CheckToggleComponent implements ControlValueAccessor {
  /** Texto opcional que se muestra a la derecha del interruptor. */
  readonly nombre = input('');
  /** Alias más descriptivo para el texto visible. Tiene prioridad sobre `nombre`. */
  readonly label = input('');
  /** Nombre del campo HTML, útil al enviar formularios nativos. */
  readonly name = input('');
  readonly value = input('true');
  readonly id = input(`check-toggle-${nextToggleId++}`);
  readonly color = input<PaletteColor>('primary');
  readonly size = input<ComponentSize>('md');
  readonly required = input(false);
  readonly ariaLabel = input('');
  /** Mantiene un tono suave del color elegido aun cuando el control está desmarcado. */
  readonly showInactiveColor = input(true, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly checked = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly checkedChange = output<boolean>();
  readonly change = output<Event>();

  readonly isChecked = signal(false);
  readonly isDisabled = signal(false);
  readonly hasInactiveColor = signal(true);

  readonly visibleLabel = computed(() => this.label() || this.nombre());

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isChecked.set(this.checked()));
    effect(() => this.isDisabled.set(this.disabled()));
    effect(() => this.hasInactiveColor.set(this.showInactiveColor()));
  }

  writeValue(value: boolean | null | undefined): void {
    this.isChecked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isChecked.set(input.checked);
    this.onChange(this.isChecked());
    this.onTouched();
    this.checkedChange.emit(this.isChecked());
    this.change.emit(event);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
