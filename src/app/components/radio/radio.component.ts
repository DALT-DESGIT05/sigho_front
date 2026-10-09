import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

export type RadioValue = string | number | null;

let nextRadioId = 0;

@Component({
  selector: 'app-radio', standalone: true, imports: [],
  templateUrl: './radio.component.html', styleUrl: './radio.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioComponent), multi: true }],
})
export class RadioComponent implements ControlValueAccessor {
  readonly nombre = input('');
  readonly label = input('');
  readonly name = input('');
  readonly value = input<RadioValue>(null);
  readonly id = input(`radio-${nextRadioId++}`);
  readonly color = input<PaletteColor>('primary');
  readonly size = input<ComponentSize>('md');
  readonly required = input(false);
  readonly ariaLabel = input('');
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly checked = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });

  readonly checkedChange = output<boolean>();
  readonly valueChange = output<RadioValue>();
  readonly change = output<Event>();

  readonly isChecked = signal(false);
  readonly isDisabled = signal(false);
  readonly visibleLabel = computed(() => this.label() || this.nombre());
  private onChange: (value: RadioValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isChecked.set(this.checked()));
    effect(() => this.isDisabled.set(this.disabled()));
  }

  writeValue(value: RadioValue): void { this.isChecked.set(this.sameValue(value, this.value())); }
  registerOnChange(fn: (value: RadioValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  handleChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isChecked.set(checked);
    if (checked) {
      this.onChange(this.value());
      this.valueChange.emit(this.value());
    }
    this.onTouched();
    this.checkedChange.emit(checked);
    this.change.emit(event);
  }

  handleBlur(): void { this.onTouched(); }
  private sameValue(first: RadioValue, second: RadioValue): boolean { return String(first) === String(second); }
}
