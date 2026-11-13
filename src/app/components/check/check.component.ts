import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

let nextCheckId = 0;

@Component({
  selector: 'app-check',
  standalone: true,
  imports: [],
  templateUrl: './check.component.html',
  styleUrl: './check.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckComponent), multi: true }],
})
export class CheckComponent implements ControlValueAccessor {
  readonly nombre = input('');
  readonly label = input('');
  readonly name = input('');
  readonly value = input('true');
  readonly id = input(`check-${nextCheckId++}`);
  readonly color = input<PaletteColor>('primary');
  readonly size = input<ComponentSize>('md');
  readonly label_position = input<'left' | 'right'>('right');
  readonly font_size = input<string | number | null>(null);
  readonly required = input(false);
  readonly ariaLabel = input('');
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly checked = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });

  readonly checkedChange = output<boolean>();
  readonly change = output<Event>();

  readonly isChecked = signal(false);
  readonly isDisabled = signal(false);
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isChecked.set(this.checked()));
    effect(() => this.isDisabled.set(this.disabled()));
  }

  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly font_size_value = computed(() => {
    const fontSize = this.font_size();
    if (fontSize === null || fontSize === '') return null;
    return typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
  });

  writeValue(value: boolean | null | undefined): void { this.isChecked.set(!!value); }
  registerOnChange(fn: (value: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isChecked.set(input.checked);
    this.onChange(this.isChecked());
    this.onTouched();
    this.checkedChange.emit(this.isChecked());
    this.change.emit(event);
  }

  handleBlur(): void { this.onTouched(); }
}
