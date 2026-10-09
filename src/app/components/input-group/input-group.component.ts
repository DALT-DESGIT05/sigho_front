import { Component, computed, effect, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor, TableColumnAlignment } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

let nextInputGroupId = 0;

@Component({
  selector: 'app-input-group',
  standalone: true,
  imports: [LabelComponent],
  templateUrl: './input-group.component.html',
  styleUrl: './input-group.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputGroupComponent), multi: true }],
})
export class InputGroupComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly title = input('');
  readonly nombre = input('');
  readonly helpText = input('');
  readonly error = input('');
  readonly placeholder = input('');
  readonly name = input('');
  readonly id = input(`input-group-${nextInputGroupId++}`);
  readonly type = input('text');
  readonly autocomplete = input('off');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly cssClass = input('');
  readonly align = input<TableColumnAlignment>('start');
  readonly size = input<ComponentSize>('md');
  readonly color = input<PaletteColor>('primary');
  readonly value = model<string | number | null | undefined>(undefined);
  readonly maxlength = input<number | null>(null);
  readonly minlength = input<number | null>(null);
  readonly min = input<number | null>(null);
  readonly ariaLabel = input('');
  /** Permite usar un control compuesto (por ejemplo, app-auto-complete) dentro del grupo. */
  readonly projectedControl = input(false);
  /** Texto que se muestra antes del input. Para contenido arbitrario use [prefix]. */
  readonly prefix = input('');
  /** Texto que se muestra después del input. Para contenido arbitrario use [suffix]. */
  readonly suffix = input('');
  readonly disabled = input(false, { transform: (value: boolean | string) => value === '' || value === true || value === 'true' });

  readonly change = output<Event>();
  readonly inputEvent = output<Event>({ alias: 'input' });
  readonly focus = output<FocusEvent>();
  readonly blur = output<FocusEvent>();
  readonly keydown = output<KeyboardEvent>();
  readonly keyup = output<KeyboardEvent>();
  readonly enter = output<KeyboardEvent>();
  readonly touch = output<void>();

  readonly inputValue = signal('');
  readonly isDisabled = signal(false);
  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly hasError = computed(() => this.invalid() || !!this.error());
  readonly alignmentClass = computed(() => `text-${this.align()}`);
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

  writeValue(value: string | number | null | undefined): void { this.value.set(value); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled.set(disabled); }
  handleInput(event: Event): void { const value = (event.target as HTMLInputElement).value; this.inputValue.set(value); this.value.set(value); this.onChange(value); this.inputEvent.emit(event); }
  handleChange(event: Event): void { this.change.emit(event); }
  handleFocus(event: FocusEvent): void { this.focus.emit(event); }
  handleBlur(event: FocusEvent): void { this.onTouched(); this.touch.emit(); this.blur.emit(event); }
  handleKeydown(event: KeyboardEvent): void { this.keydown.emit(event); if (event.key === 'Enter') this.enter.emit(event); }
  handleKeyup(event: KeyboardEvent): void { this.keyup.emit(event); }
  private toText(value: string | number | null | undefined): string { return value == null ? '' : String(value); }
}
