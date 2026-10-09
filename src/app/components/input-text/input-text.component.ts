import { Component, ElementRef, computed, effect, forwardRef, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor, TableColumnAlignment } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

let nextInputTextId = 0;

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputTextComponent), multi: true }],
})
export class InputTextComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly title = input('');
  readonly nombre = input('');
  readonly helpText = input('');
  readonly error = input('');
  readonly placeholder = input('');
  readonly name = input('');
  readonly id = input(`input-text-${nextInputTextId++}`);
  readonly type = input('text');
  readonly allowNegative = input(true);
  readonly autocomplete = input('off');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly cssClass = input('');
  readonly align = input<TableColumnAlignment>('start');
  readonly size = input<ComponentSize>('md');
  readonly color = input<PaletteColor>('primary');
  /** Color opcional del valor mostrado, usando la paleta del proyecto. */
  readonly textColor = input<PaletteColor | ''>('');
  readonly value = input<string | number | null | undefined>(undefined);
  readonly maxlength = input<number | null>(null);
  readonly minlength = input<number | null>(null);
  readonly ariaLabel = input('');
  /** Muestra el label externo. */
  readonly showLabel = input(true);
  /** Muestra el label dentro del input. */
  readonly showFloatingLabel = input(false);
  /** Atajo: en xs oculta el label externo y muestra el flotante. */
  readonly responsiveFloatingLabel = input(false);
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });

  readonly valueChange = output<string>();
  readonly change = output<Event>();
  readonly inputEvent = output<Event>({ alias: 'input' });
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly keydown = output<KeyboardEvent>();
  readonly keyup = output<KeyboardEvent>();
  readonly enter = output<KeyboardEvent>();

  readonly inputValue = signal('');
  readonly isDisabled = signal(false);
  private readonly input_control = viewChild<ElementRef<HTMLInputElement>>('input_control');
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        this.inputValue.set(this.toText(value));
      }
    });
    effect(() => this.isDisabled.set(this.disabled()));
  }

  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly hasError = computed(() => this.invalid() || !!this.error());
  readonly useFloatingLabel = computed(() => !!this.visibleLabel() && (this.showFloatingLabel() || (this.responsiveFloatingLabel() && this.size() === 'xs')));
  readonly showExternalLabel = computed(() => !!this.visibleLabel() && this.showLabel() && !(this.responsiveFloatingLabel() && this.size() === 'xs'));
  readonly alignmentClass = computed(() => `text-${this.align()}`);

  writeValue(value: string | number | null | undefined): void { this.inputValue.set(this.toText(value)); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }

  on_label_click(evento: MouseEvent): void {
    evento.preventDefault();
    if (!this.isDisabled()) this.input_control()?.nativeElement.focus();
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
      let value = input.value;

      if (this.type() === 'number' &&!this.allowNegative() &&Number(value) < 0) {
        value = '';
        input.value = '';
      }
    this.inputValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.inputEvent.emit(event);
  }

  handleChange(event: Event): void { this.change.emit(event); }
  handleFocus(event: FocusEvent): void { this.focus.emit(event); }
  handleBlur(event: FocusEvent): void { this.onTouched(); this.blur.emit(event); }
  handleKeydown(event: KeyboardEvent): void { this.keydown.emit(event); if (event.key === 'Enter') this.enter.emit(event); }
  handleKeyup(event: KeyboardEvent): void { this.keyup.emit(event); }

  private toText(value: string | number | null | undefined): string { return value == null ? '' : String(value); }
}
