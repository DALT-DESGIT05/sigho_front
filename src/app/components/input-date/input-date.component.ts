import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, effect, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, DateControlType, PaletteColor } from '../../interfaces/util.interface';
import { DateService } from '../../services/date.service';
import { LabelComponent } from '../label/label.component';

let nextDateId = 0;

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputDateComponent), multi: true }],
})
export class InputDateComponent implements ControlValueAccessor {
  private readonly dateService = inject(DateService);
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly inputValue = signal('');

  readonly label = input('');
  readonly title = input('');
  readonly nombre = input('');
  readonly helpText = input('');
  readonly error = input('');
  readonly placeholder = input('');
  readonly name = input('');
  readonly id = input(`date-${nextDateId++}`);
  readonly min = input('');
  readonly max = input('');
  readonly autocomplete = input('off');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly cssClass = input('');
  readonly size = input<ComponentSize>('md');
  readonly color = input<PaletteColor>('primary');
  readonly type = input<DateControlType>('date');
  readonly value = input<string | Date | number | null | undefined>(null);
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  /** Muestra el label externo. */
  readonly showLabel = input(true);
  /** Muestra el label dentro del input. */
  readonly showFloatingLabel = input(false);
  /** Atajo: en xs oculta el label externo y muestra el flotante. */
  readonly responsiveFloatingLabel = input(false);
  readonly isDisabled = signal(false);
  private readonly input_control = viewChild<ElementRef<HTMLInputElement>>('input_control');

  readonly valueChange = output<string>();
  readonly change = output<Event>();

  constructor() {
    effect(() => this.inputValue.set(this.toNativeValue(this.value(), this.type())));
    effect(() => this.isDisabled.set(this.disabled()));
  }

  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly hasError = computed(() => this.invalid() || !!this.error());
  readonly useFloatingLabel = computed(() => !!this.visibleLabel() && (this.showFloatingLabel() || (this.responsiveFloatingLabel() && this.size() === 'xs')));
  readonly showExternalLabel = computed(() => !!this.visibleLabel() && this.showLabel() && !(this.responsiveFloatingLabel() && this.size() === 'xs'));

  writeValue(value: string | Date | number | null | undefined): void {
    this.inputValue.set(this.toNativeValue(value, this.type()));
  }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  on_label_click(evento: MouseEvent): void {
    evento.preventDefault();
    if (!this.isDisabled()) this.input_control()?.nativeElement.focus();
  }

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit(event);
  }

  handleBlur(): void { this.onTouched(); }

  private toNativeValue(value: string | Date | number | null | undefined, type: DateControlType): string {
    if (value == null || value === '') return '';

    const parsed = this.dateService.parse(value);
    if (!parsed) return typeof value === 'string' ? value : '';

    switch (type) {
      case 'datetime-local': return parsed.setZone(this.dateService.defaultZone).toFormat("yyyy-MM-dd'T'HH:mm");
      case 'time': return parsed.setZone(this.dateService.defaultZone).toFormat('HH:mm');
      case 'month': return parsed.setZone(this.dateService.defaultZone).toFormat('yyyy-MM');
      default: return parsed.setZone(this.dateService.defaultZone).toFormat('yyyy-MM-dd');
    }
  }
}
