import { ImagenPipe } from '../../pipes/imagen.pipe';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, computed, effect, forwardRef, inject, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

export type SelectValue = string | number | null;
export interface SelectOption { value: SelectValue; label: string; detail?: string; count?: number; icon?: string; image?: string; tone?: PaletteColor; disabled?: boolean; }
export interface SelectChangeEvent { value: SelectValue; option: SelectOption | null; }

@Component({ selector: 'app-select', imports: [ImagenPipe, CommonModule, LabelComponent], templateUrl: './select.component.html', styleUrl: './select.component.scss', providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }], host: { '(document:click)': 'closeWhenClickingOutside($event.target)' } })
export class SelectComponent implements ControlValueAccessor {
  readonly label = input(''); readonly title = input(''); readonly nombre = input(''); readonly helpText = input(''); readonly error = input(''); readonly id = input('');
  readonly required = input(false); readonly invalid = input(false); readonly ariaLabel = input(''); readonly color = input<PaletteColor>('primary');
  /** Muestra el label externo. */ readonly showLabel = input(true);
  /** Muestra el label dentro del selector. */ readonly showFloatingLabel = input(false);
  /** Atajo: en xs oculta el label externo y muestra el flotante. */ readonly responsiveFloatingLabel = input(false);
  readonly options = input<SelectOption[]>([]); readonly apiItems = input<object[]>([]); readonly valueField = input('id'); readonly labelField = input('nombre');
  readonly detailField = input(''); readonly countField = input(''); readonly iconField = input(''); readonly imageField = input(''); readonly toneField = input('');
  /** Color del texto secundario mostrado como detalle de cada opci\u00f3n. */
  readonly detailColor = input<PaletteColor>('secondary');
  readonly placeholder = input('Seleccionar'); readonly showEmptyOption = input(false); readonly emptyOptionLabel = input('-- SELECCIONAR --');
  readonly disabled = input(false); readonly selectedValue = input<SelectValue>(null); readonly size = input<ComponentSize>('md');
  readonly selectedValueChange = output<SelectValue>(); readonly change = output<SelectChangeEvent>();
  readonly isOpen = signal(false); private readonly innerValue = signal<SelectValue>(null); private readonly disabledByForm = signal(false);
  readonly resolvedOptions = computed<SelectOption[]>(() => {
    if (this.options().length) return this.options();
    return this.apiItems().map(item => ({ value: this.read(item, this.valueField()) as SelectValue, label: String(this.read(item, this.labelField()) ?? ''),
      detail: this.detailField() ? String(this.read(item, this.detailField()) ?? '') : undefined, count: this.countField() ? Number(this.read(item, this.countField())) : undefined,
      icon: this.iconField() ? String(this.read(item, this.iconField()) ?? '') : undefined, image: this.imageField() ? String(this.read(item, this.imageField()) ?? '') : undefined,
      tone: this.toneField() ? this.read(item, this.toneField()) as PaletteColor : undefined, disabled: Boolean(this.read(item, 'disabled')) }));
  });
  readonly displayOptions = computed(() => this.showEmptyOption() ? [{ value: '', label: this.emptyOptionLabel(), tone: 'secondary' as PaletteColor }, ...this.resolvedOptions().filter(option => !this.sameValue(option.value, ''))] : this.resolvedOptions());
  readonly selectedOption = computed(() => this.displayOptions().find(option => this.sameValue(option.value, this.innerValue())) ?? null);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly hasError = computed(() => this.invalid() || !!this.error());
  readonly useFloatingLabel = computed(() => !!this.visibleLabel() && (this.showFloatingLabel() || (this.responsiveFloatingLabel() && this.size() === 'xs')));
  readonly showExternalLabel = computed(() => !!this.visibleLabel() && this.showLabel() && !(this.responsiveFloatingLabel() && this.size() === 'xs'));
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private onChange: (value: SelectValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() { effect(() => this.setValue(this.selectedValue(), false)); }
  toggle(): void { if (!this.isDisabled()) this.isOpen.update(open => !open); }
  on_label_click(evento: MouseEvent): void { evento.preventDefault(); this.toggle(); }
  select(option: SelectOption): void { if (option.disabled) return; this.setValue(option.value, true); this.isOpen.set(false); this.onTouched(); }
  writeValue(value: SelectValue): void { this.setValue(value, false); }
  registerOnChange(fn: (value: SelectValue) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabledByForm.set(disabled); if (disabled) this.isOpen.set(false); }
  closeWhenClickingOutside(target: EventTarget | null): void { if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) this.isOpen.set(false); }
  private setValue(value: SelectValue, emit: boolean): void { this.innerValue.set(value); if (emit) { this.onChange(value); this.selectedValueChange.emit(value); this.change.emit({ value, option: this.selectedOption() }); } }
  private read(item: object, path: string): unknown { return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, item); }
  private sameValue(first: SelectValue, second: SelectValue): boolean { return String(first) === String(second); }
}
