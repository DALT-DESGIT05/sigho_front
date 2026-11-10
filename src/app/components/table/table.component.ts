import { CommonModule } from '@angular/common';
import { Component, TemplateRef, computed, effect, input, output, signal } from '@angular/core';
import { MESSAGE_DEFAULT_TABLE } from '../../config/constants';
import { Links, Paginado } from '../../interfaces/response.interface';
import { TableActionEvent, TableBooleanColumn, TableCellContext, TableColumn, TableColumnAlignment, TableControlChange, TableHeaderCell, TableIconLinkClick, TableRadioColumn, TableRowAction, TableProgressBarsColumn, TableStatusCircleColumn, TableTypeIndicatorOrdenesMedicasColumn, PaletteColor, TableSelectChange, TableSelectOption, TableSelectionChange, TableSelectionMode, TableSelectionTemplateContext, TableSize, ComponentSize } from '../../interfaces/util.interface';
import { BadgeComponent } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { CheckComponent } from '../check/check.component';
import { SelectChangeEvent, SelectComponent, SelectValue } from '../select/select.component';
import { RadioComponent } from '../radio/radio.component';
import { CheckToggleComponent } from '../check-toggle/check-toggle.component';
import { IconLinkComponent } from '../icon-link/icon-link.component';
import { StatusCircleComponent } from '../status-circle/status-circle.component';
import { TypeIndicatorOrdenesMedicasComponent } from '../type-indicator-ordenes-medicas/type-indicator-ordenes-medicas.component';
import { ProgressBarsComponent } from '../progress-bars/progress-bars.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CheckComponent, CheckToggleComponent, RadioComponent, SelectComponent, IconLinkComponent, StatusCircleComponent, TypeIndicatorOrdenesMedicasComponent, ProgressBarsComponent, PaginationComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent<T extends object = object> {
  /** Si no se indican columnas, se crean a partir de las propiedades del primer registro. */
  readonly columns = input<TableColumn<T>[]>([]);
  /** Plantillas de celda por clave de columna. Permite renderizar cualquier contenido Angular. */
  readonly cellTemplates = input<Record<string, TemplateRef<TableCellContext<T>>>>({});
  readonly headerRows = input<TableHeaderCell[][]>([]);
  readonly rows = input<T[]>([]);
  readonly page = input<Paginado<T> | null>(null);
  readonly actions = input<TableRowAction<T>[]>([]);
  readonly loading = input(false);
  readonly emptyMessage = input(MESSAGE_DEFAULT_TABLE);
  readonly actionsLabel = input('Acciones');
  /** Tamano visual: xs, sm, md o lg. */
  readonly size = input<TableSize>('md');
  readonly paginationSize = input<ComponentSize>('md');
  /** Alto del area desplazable. Use null para que la tabla crezca sin limite. */
  readonly scrollHeight = input<string | null>('400px');
  readonly selectionMode = input<TableSelectionMode>('none');
  /** Muestra el checkbox de selección masiva solo cuando la pantalla lo permite. */
  readonly showSelectAll = input(true);
  readonly selectionKey = input('id');
  readonly selectedKeys = input<Array<string | number>>([]);
  /** Fila resaltada externamente. Use `selectionKey` para identificarla. */
  readonly highlightedRowKey = input<string | number | null>(null);
  /** Plantillas opcionales para personalizar el control de seleccion. */
  readonly selectionHeaderTemplate = input<TemplateRef<TableSelectionTemplateContext<T>>>();
  readonly selectionCellTemplate = input<TemplateRef<TableSelectionTemplateContext<T>>>();

  readonly action = output<TableActionEvent<T>>();
  readonly pageChange = output<string | null>();
  readonly selectChange = output<TableSelectChange<T>>();
  readonly controlChange = output<TableControlChange<T>>();
  readonly iconLinkClick = output<TableIconLinkClick<T>>();
  readonly selectionChange = output<TableSelectionChange<T>>();

  private readonly selectedKeySet = signal(new Set<string>());
  constructor() { effect(() => this.selectedKeySet.set(new Set(this.selectedKeys().map(key => String(key))))); }

  readonly tableRows = computed(() => this.page()?.data ?? this.rows());

  rowTrack(index: number, row: T): unknown {
    const key = this.rowSelectionKey(row);
    return key ? key : index;
  }

  readonly resolvedColumns = computed<TableColumn<T>[]>(() => {
    if (this.columns().length > 0) {
      return this.columns();
    }

    const firstRow = this.tableRows()[0];
    if (!firstRow) {
      return [];
    }

    return Object.keys(firstRow).map(key => ({
      key,
      label: this.defaultColumnLabel(key),
    }));
  });

  readonly resolvedHeaderRows = computed<TableHeaderCell[][]>(() => this.headerRows().length > 0
      ? this.headerRows()
      : [this.resolvedColumns().map(column => ({
        label: column.label ?? column.key,
        cssClass: column.headerCssClass,
        align: column.align,
      }))]);

  readonly hasActions = computed(() => this.actions().length > 0);
  readonly hasSelection = computed(() => this.selectionMode() !== 'none');

  readonly emptyColspan = computed(() => Math.max(1, this.resolvedColumns().length + (this.hasActions() ? 1 : 0) + (this.hasSelection() ? 1 : 0)));

  private defaultColumnLabel(key: string): string {
    return key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, character => character.toUpperCase());
  }

  valueFor(row: T, key: string): unknown {
    return key.split('.').reduce<unknown>((value, segment) => {
      return value && typeof value === 'object'
        ? (value as Record<string, unknown>)[segment]
        : undefined;
    }, row);
  }

  displayValue(column: TableColumn<T>, row: T): string {
    const value = this.valueFor(row, column.key);
    return column.formatter ? column.formatter(value, row) : value == null ? '' : String(value);
  }

  cellTemplate(column: TableColumn<T>): TemplateRef<TableCellContext<T>> | undefined {
    return column.template ?? this.cellTemplates()[column.key];
  }

  badgeText(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.badge!.texto, row, column) ?? this.displayValue(column, row);
  }

  badgeClasses(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.badge!.clases, row, column) ?? 'primary';
  }

  badgeTitle(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.badge!.title, row, column) ?? '';
  }
  statusCircleClasses(column: TableColumn<T>, row: T): PaletteColor {
    return this.resolveCellValue(column.statusCircle!.clases, row, column) ?? 'secondary';
  }

  statusCircleTitle(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.statusCircle!.title, row, column) ?? '';
  }

  typeIndicatorText(
    field: 'tipo' | 'texto',
    column: TableColumn<T>,
    row: T
  ): string {
    const value = this.resolveCellValue(column.typeIndicatorOrdenesMedicas![field], row, column);
    return String(value ?? (field === 'texto' ? this.displayValue(column, row) : ''));
  }

  typeIndicatorCode(column: TableColumn<T>, row: T): string | number | null {
    return this.resolveCellValue(column.typeIndicatorOrdenesMedicas!.codigoTipo, row, column) ?? null;
  }
  progressValue(
    field: 'value' | 'porcentaje',
    column: TableColumn<T>,
    row: T
  ): number | string | undefined {
    return this.resolveCellValue(column.progressBars![field], row, column)
      ?? (field === 'value' ? this.valueFor(row, column.key) as number | string | undefined : undefined);
  }

progressWidth(column: TableColumn<T>, row: T): string | number {
    return this.resolveCellValue(column.progressBars!.width, row, column) ?? '100%';
  }

  progressColor(column: TableColumn<T>, row: T): PaletteColor | string {
    return this.resolveCellValue(column.progressBars!.color, row, column) ?? 'secondary';
  }

  progressTextOption(
    field: 'clases' | 'clasesBarra' | 'ariaLabel',
    column: TableColumn<T>,
    row: T
  ): string {
    return this.resolveCellValue(column.progressBars![field], row, column) ?? '';
  }

  progressShowValue(column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(column.progressBars!.showValue, row, column) ?? false;
  }

  selectOptions(column: TableColumn<T>, row: T): TableSelectOption[] {
    return this.resolveCellValue(column.select!.options, row, column) ?? [];
  }

  selectValue(column: TableColumn<T>, row: T): SelectValue {
    return this.resolveCellValue(column.select!.value, row, column)
      ?? this.valueFor(row, column.key) as SelectValue;
  }

  selectDisabled(column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(column.select!.disabled, row, column) ?? false;
  }

  controlValue(config: TableBooleanColumn<T>, column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(config.value, row, column) ?? Boolean(this.valueFor(row, column.key));
  }

  controlLabel(config: Pick<TableBooleanColumn<T>, 'label'>, column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(config.label, row, column) ?? '';
  }

  controlDisabled(config: Pick<TableBooleanColumn<T>, 'disabled'>, column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(config.disabled, row, column) ?? false;
  }

  radioValue(config: TableRadioColumn<T>, column: TableColumn<T>, row: T): string | number | null {
    return this.resolveCellValue(config.value, row, column) ?? this.valueFor(row, column.key) as string | number | null;
  }

  radioChecked(config: TableRadioColumn<T>, column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(config.checked, row, column) ?? false;
  }

  iconLinkText(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.iconLink!.texto, row, column) ?? this.displayValue(column, row);
  }

  iconLinkHref(column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.iconLink!.href, row, column) ?? '#';
  }

  iconLinkValue(field: 'icon' | 'rel' | 'title' | 'ariaLabel' | 'clases', column: TableColumn<T>, row: T): string {
    return this.resolveCellValue(column.iconLink![field], row, column) ?? '';
  }

  iconLinkDisabled(column: TableColumn<T>, row: T): boolean {
    return this.resolveCellValue(column.iconLink!.disabled, row, column) ?? false;
  }

  alignmentClass(align?: TableColumnAlignment): string {
    return align ? `text-${align}` : '';
  }

  mergeClasses(...classes: Array<string | undefined>): string {
    return classes.filter(Boolean).join(' ');
  }

  isVisible(rowAction: TableRowAction<T>, row: T): boolean {
    return rowAction.visible ? rowAction.visible(row) : true;
  }

  isDisabled(rowAction: TableRowAction<T>, row: T): boolean {
    return rowAction.disabled ? rowAction.disabled(row) : false;
  }

  rowSelectionKey(row: T): string {
    const specified = this.valueFor(row, this.selectionKey());
    if (specified !== undefined && specified !== null && specified !== '') {
      return String(specified);
    }
    const fallbackKeys = [
      'atencion_id',
      'id_aten',
      'id',
      'codigo_episodio',
      'imagen_id',
      'id_orden_imag',
      'laboratorio_id',
      'orden_id',
      'id_orden_medica',
      'diagnostico_id',
      'id_diagnostico',
      'personal_id',
      'id_persona',
    ];
    const record = row as Record<string, unknown>;
    for (const key of fallbackKeys) {
      const val = record[key];
      if (val !== undefined && val !== null && val !== '') {
        return String(val);
      }
    }
    return '';
  }

  isSelected(row: T): boolean {
    return this.selectedKeySet().has(this.rowSelectionKey(row));
  }

  isActionHighlighted(row: T): boolean {
    return this.highlightedRowKey() !== null
      && this.rowSelectionKey(row) === String(this.highlightedRowKey());
  }

  readonly allVisibleSelected = computed(() => this.tableRows().length > 0 && this.tableRows().every(row => this.isSelected(row)));

  toggleSelection(row: T, selected?: boolean | Event): void {
    const key = this.rowSelectionKey(row);
    if (!key) {
      return;
    }

    const shouldSelect = selected === undefined
      ? !this.selectedKeySet().has(key)
      : this.resolveCheckedValue(selected);
    if (shouldSelect) {
      this.selectedKeySet.update(keys => this.selectionMode() === 'radio' ? new Set([key]) : new Set(keys).add(key));
    } else {
      this.selectedKeySet.update(keys => { const next = new Set(keys); next.delete(key); return next; });
    }
    this.emitSelection(row, shouldSelect);
  }

  toggleAllVisible(selected: boolean | Event): void {
    const shouldSelect = this.resolveCheckedValue(selected);
    const nextKeys = new Set(this.selectedKeySet());
    this.tableRows().forEach(row => {
      const key = this.rowSelectionKey(row);
      if (key) {
        shouldSelect ? nextKeys.add(key) : nextKeys.delete(key);
      }
    });
    this.selectedKeySet.set(nextKeys); this.emitSelection();
  }

  private emitSelection(row?: T, selected?: boolean): void {
    this.selectionChange.emit({ row, selected, selectedKeys: [...this.selectedKeySet()] });
  }

  private resolveCheckedValue(value: boolean | Event): boolean {
    return typeof value === 'boolean'
      ? value
      : (value.target as HTMLInputElement | null)?.checked ?? false;
  }

  private resolveCellValue<TValue>(
    resolver: TValue | ((value: unknown, row: T) => TValue) | undefined,
    row: T,
    column: TableColumn<T>
  ): TValue | undefined {
    return typeof resolver === 'function'
      ? (resolver as (value: unknown, row: T) => TValue)(this.valueFor(row, column.key), row)
      : resolver;
  }

  emitAction(rowAction: TableRowAction<T>, row: T): void {
    this.action.emit({ action: rowAction.id, row });
  }

  emitSelectChange(column: TableColumn<T>, row: T, event: SelectChangeEvent): void {
    this.selectChange.emit({ column, row, value: event.value, option: event.option });
  }

  emitIconLinkClick(column: TableColumn<T>, row: T, event: MouseEvent): void {
    this.iconLinkClick.emit({ column, row, event });
  }

  emitControlChange(type: TableControlChange<T>['type'], column: TableColumn<T>, row: T, value: TableControlChange<T>['value']): void {
    this.controlChange.emit({ type, column, row, value });
  }

  requestPage(link: Links): void {
    if (link.url) {
      this.pageChange.emit(link.url);
    }
  }

  pageLabel(label: string): string {
    return label
      .replace(/<[^>]*>/g, '')
      .replace(/&laquo;/g, String.fromCharCode(171))
      .replace(/&raquo;/g, String.fromCharCode(187))
      .replace(/&amp;/g, '&');
  }
}
