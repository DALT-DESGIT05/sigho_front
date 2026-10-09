import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, computed, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

export type AutoCompleteDataSource<T> = (term: string) => Observable<readonly T[]>;
export type AutoCompleteValueResolver<T> = (value: unknown) => Observable<T | null>;

@Component({
  selector: 'app-auto-complete', standalone: true, imports: [CommonModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './auto-complete.component.html', styleUrl: './auto-complete.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoCompleteComponent), multi: true }],
})
export class AutoCompleteComponent<T extends object = any> implements ControlValueAccessor, OnInit {
  readonly label = input('');
  readonly title = input('');
  readonly nombre = input('');
  readonly id = input('');
  readonly required = input(false);
  readonly color = input<PaletteColor>('primary');
  /** Muestra el label externo. */
  readonly showLabel = input(true);
  /** Muestra el label dentro del control. */
  readonly showFloatingLabel = input(false);
  /** Atajo: en xs oculta el label externo y muestra el flotante. */
  readonly responsiveFloatingLabel = input(false);
  readonly dataSource = input.required<AutoCompleteDataSource<T>>();
  readonly resolveValue = input<AutoCompleteValueResolver<T>>();
  readonly valueKey = input<string>();
  readonly labelKey = input('label');
  readonly displayWith = input<(option: T) => string>();
  readonly placeholder = input('Buscar...');
  readonly minLength = input(0);
  readonly debounceTime = input(300);
  readonly emptyMessage = input('No se encontraron resultados.');
  readonly loadingMessage = input('Buscando...');
  readonly clearable = input(true);
  readonly size = input<ComponentSize>('md');
  readonly searchChange = output<string>();
  readonly optionSelected = output<T>();
  readonly cleared = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly options = signal<readonly T[]>([]);
  readonly selectedOption = signal<T | null>(null);
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly activeIndex = signal(-1);
  readonly disabled = signal(false);
  readonly searchText = signal('');
  private readonly input_control = viewChild<ElementRef<HTMLInputElement>>('input_control');
  readonly hasSelection = computed(() => this.selectedOption() !== null);
  readonly emptyStateMessage = computed(() => {
    const minimum = this.minLength();
    return minimum > 0 && this.searchText().trim().length < minimum
      ? `Escribe al menos ${minimum} caracteres para buscar.`
      : this.emptyMessage();
  });
  readonly visibleLabel = computed(() => this.label() || this.nombre());
  readonly label_title = computed(() => this.title() || this.visibleLabel());
  readonly useFloatingLabel = computed(() => !!this.visibleLabel() && (this.showFloatingLabel() || (this.responsiveFloatingLabel() && this.size() === 'xs')));
  readonly showExternalLabel = computed(() => !!this.visibleLabel() && this.showLabel() && !(this.responsiveFloatingLabel() && this.size() === 'xs'));
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(this.debounceTime()), distinctUntilChanged(),
      switchMap((term) => {
        this.searchText.set(term); this.searchChange.emit(term); this.selectedOption.set(null); this.onChange(null); this.hasError.set(false);
        if (term.trim().length < this.minLength()) { this.isLoading.set(false); return of([] as readonly T[]); }
        this.isLoading.set(true);
        return this.dataSource()(term.trim()).pipe(catchError(() => { this.hasError.set(true); return of([] as readonly T[]); }), finalize(() => this.isLoading.set(false)));
      }), takeUntilDestroyed(this.destroyRef),
    ).subscribe((options) => { this.options.set(options); this.activeIndex.set(options.length ? 0 : -1); });
  }

  writeValue(value: unknown): void {
    if (value === null || value === undefined || value === '') { this.selectedOption.set(null); this.setSearchText(''); return; }
    if (this.isOption(value)) { this.setSelectedOption(value, false); return; }
    const resolveValue = this.resolveValue();
    if (!resolveValue) { this.selectedOption.set(null); this.setSearchText(String(value)); return; }
    this.isLoading.set(true);
    resolveValue(value).pipe(finalize(() => this.isLoading.set(false))).subscribe({ next: (option) => { if (option) this.setSelectedOption(option, false); }, error: () => this.hasError.set(true) });
  }
  registerOnChange(fn: (value: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); isDisabled ? this.searchControl.disable({ emitEvent: false }) : this.searchControl.enable({ emitEvent: false }); }
  on_label_click(evento: MouseEvent): void {
    evento.preventDefault();
    if (this.disabled()) return;
    this.input_control()?.nativeElement.focus();
    this.open();
  }
  open(): void { if (!this.disabled()) { this.isOpen.set(true); if (!this.searchControl.value && this.minLength() === 0) { this.searchControl.setValue(' '); this.searchControl.setValue(''); } } }
  toggle(event: Event): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.isOpen() ? this.isOpen.set(false) : this.open();
  }
  close(): void { window.setTimeout(() => { this.isOpen.set(false); this.onTouched(); }, 150); }
  select(option: T): void { this.setSelectedOption(option, true); this.isOpen.set(false); }
  clear(event?: MouseEvent): void { event?.preventDefault(); event?.stopPropagation(); this.selectedOption.set(null); this.options.set([]); this.setSearchText(''); this.onChange(null); this.cleared.emit(); }
  onKeydown(event: KeyboardEvent): void {
    const options = this.options(); if (!this.isOpen() || !options.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); this.activeIndex.update((index) => Math.min(index + 1, options.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.activeIndex.update((index) => Math.max(index - 1, 0)); }
    else if (event.key === 'Enter' && this.activeIndex() >= 0) { event.preventDefault(); this.select(options[this.activeIndex()]); }
    else if (event.key === 'Escape') this.isOpen.set(false);
  }
  getLabel(option: T): string { const displayWith = this.displayWith(); if (displayWith) return displayWith(option); const value = this.getValue(option, this.labelKey()); return value == null ? '' : String(value); }
  trackByOption = (_: number, option: T): unknown => { const valueKey = this.valueKey(); return valueKey ? this.getValue(option, valueKey) : option; };
  private setSelectedOption(option: T, emitChange: boolean): void { this.selectedOption.set(option); this.setSearchText(this.getLabel(option)); if (emitChange) { const valueKey = this.valueKey(); this.onChange(valueKey ? this.getValue(option, valueKey) : option); this.optionSelected.emit(option); } }
  private setSearchText(value: string): void { this.searchControl.setValue(value, { emitEvent: false }); this.searchText.set(value); }
  private getValue(option: T, path: string): unknown { return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, option); }
  private isOption(value: unknown): value is T { return typeof value === 'object' && value !== null; }
}
