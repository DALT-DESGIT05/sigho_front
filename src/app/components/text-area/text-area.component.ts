import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

let nextTextAreaId = 0;

@Component({
  selector: 'app-text-area', standalone: true, imports: [LabelComponent],
  templateUrl: './text-area.component.html', styleUrl: './text-area.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextAreaComponent), multi: true }],
})
export class TextAreaComponent implements ControlValueAccessor {
  readonly label = input(''); readonly title = input(''); readonly nombre = input(''); readonly helpText = input(''); readonly error = input(''); readonly placeholder = input('');
  readonly name = input(''); readonly id = input(`text-area-${nextTextAreaId++}`); readonly required = input(false); readonly readonly = input(false);
  readonly invalid = input(false); readonly cssClass = input(''); readonly size = input<ComponentSize>('md'); readonly color = input<PaletteColor>('primary');
  readonly value = input<string | number | null | undefined>(null); readonly maxlength = input<number | null>(null); readonly minlength = input<number | null>(null);
  readonly rows = input(4); readonly resize = input<'none' | 'both' | 'horizontal' | 'vertical'>('vertical'); readonly ariaLabel = input('');
  /** Muestra el label externo. */
  readonly showLabel = input(true);
  /** Muestra el label dentro del textarea con el estilo form-floating. */
  readonly showFloatingLabel = input(false);
  /** Atajo: en xs oculta el label externo y muestra el flotante. */
  readonly responsiveFloatingLabel = input(false);
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });
  readonly valueChange = output<string>(); readonly change = output<Event>(); readonly inputEvent = output<Event>({ alias: 'input' });
  readonly focus = output<FocusEvent>(); readonly blur = output<FocusEvent>();
  readonly inputValue = signal(''); readonly isDisabled = signal(false);
  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly hasError = computed(() => this.invalid() || !!this.error());
  readonly useFloatingLabel = computed(() => !!this.visibleLabel() && (this.showFloatingLabel() || (this.responsiveFloatingLabel() && this.size() === 'xs')));
  readonly showExternalLabel = computed(() => !!this.visibleLabel() && this.showLabel() && !(this.responsiveFloatingLabel() && this.size() === 'xs'));
  private onChange: (value: string) => void = () => undefined; private onTouched: () => void = () => undefined;
  constructor() { effect(() => this.inputValue.set(this.toText(this.value()))); effect(() => this.isDisabled.set(this.disabled())); }
  writeValue(value: string | number | null | undefined): void { this.inputValue.set(this.toText(value)); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }
  handleInput(event: Event): void { const value = (event.target as HTMLTextAreaElement).value; this.inputValue.set(value); this.onChange(value); this.valueChange.emit(value); this.inputEvent.emit(event); }
  handleChange(event: Event): void { this.change.emit(event); }
  handleFocus(event: FocusEvent): void { this.focus.emit(event); }
  handleBlur(event: FocusEvent): void { this.onTouched(); this.blur.emit(event); }
  private toText(value: string | number | null | undefined): string { return value == null ? '' : String(value); }
}
