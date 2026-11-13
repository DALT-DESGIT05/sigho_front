export type PaletteColor =
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'info'
  | 'purple'
  | 'fuchsia';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg';
export type DateControlType = 'date' | 'datetime-local' | 'time' | 'month';

export type ButtonVariant = 'solid' | 'outline';
export type OutlineHover = 'fill' | 'border';
export type ButtonAction =
  | 'save'
  | 'update'
  | 'delete'
  | 'edit'
  | 'create'
  | 'cancel'
  | 'close'
  | 'exit'
  | 'search'
  | 'view'
  | 'print'
  | 'download'
  | 'send'
  | 'clear'
  | 'pdf'
  | 'excel';

export interface ButtonActionDefinition {
  text: string;
  icon: string;
  color: PaletteColor;
}

export type ModalSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  |  'xxl'
  | 'fullscreen'
  | 'fullscreen-sm-down'
  | 'fullscreen-md-down'
  | 'fullscreen-lg-down'
  | 'fullscreen-xl-down';

export type TableColumnAlignment = 'start' | 'center' | 'end';
export type TableSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TableHeaderCell {
  label: string;
  colspan?: number;
  rowspan?: number;
  cssClass?: string;
  align?: TableColumnAlignment;
}

export interface TableCellContext<T> {
  $implicit: T;
  value: unknown;
  column: TableColumn<T>;
  index: number;
}

export type TableCellValueResolver<T, TValue> = TValue | ((value: unknown, row: T) => TValue);

export interface TableBadgeColumn<T> {
  texto?: TableCellValueResolver<T, string>;
  clases?: TableCellValueResolver<T, string>;
  icon?: TableCellValueResolver<T, string>;
  title?: TableCellValueResolver<T, string>;
  size?: ComponentSize;
}
/** Renderiza un app-status-circle dentro de cualquier celda de la tabla. */
export interface TableStatusCircleColumn<T> {
  clases?: TableCellValueResolver<T, PaletteColor>;
  title?: TableCellValueResolver<T, string>;
  size?: ComponentSize;
}

/** Renderiza un app-type-indicator-ordenes-medicas dentro de cualquier celda. */
export interface TableTypeIndicatorOrdenesMedicasColumn<T> {
  tipo?: TableCellValueResolver<T, string>;
  texto?: TableCellValueResolver<T, string>;
  codigoTipo?: TableCellValueResolver<T, string | number | null>;
  size?: ComponentSize;
}
/** Renderiza un app-progress-bars dentro de cualquier celda de la tabla. */
export interface TableProgressBarsColumn<T> {
  value?: TableCellValueResolver<T, number | string | undefined>;
  porcentaje?: TableCellValueResolver<T, number | string | undefined>;
  width?: TableCellValueResolver<T, string | number>;
  color?: TableCellValueResolver<T, PaletteColor | string>;
  clases?: TableCellValueResolver<T, string>;
  clasesBarra?: TableCellValueResolver<T, string>;
  ariaLabel?: TableCellValueResolver<T, string>;
  showValue?: TableCellValueResolver<T, boolean>;
  size?: ComponentSize;
}

export interface TableSelectOption {
  value: string | number | null;
  label: string;
  detail?: string;
  count?: number;
  icon?: string;
  image?: string;
  tone?: PaletteColor;
  disabled?: boolean;
}

export interface TableSelectColumn<T> {
  options: TableCellValueResolver<T, TableSelectOption[]>;
  value?: TableCellValueResolver<T, string | number | null>;
  placeholder?: string;
  disabled?: TableCellValueResolver<T, boolean>;
  size?: ComponentSize;
}

export interface TableBooleanColumn<T> {
  value?: TableCellValueResolver<T, boolean>;
  label?: TableCellValueResolver<T, string>;
  disabled?: TableCellValueResolver<T, boolean>;
  color?: PaletteColor;
  size?: ComponentSize;
}

export interface TableRadioColumn<T> extends Omit<TableBooleanColumn<T>, 'value'> {
  value?: TableCellValueResolver<T, string | number | null>;
  checked?: TableCellValueResolver<T, boolean>;
  name?: string;
}

/** Renderiza un app-icon-link dentro de cualquier celda de la tabla. */
export interface TableIconLinkColumn<T> {
  texto?: TableCellValueResolver<T, string>;
  href?: TableCellValueResolver<T, string>;
  icon?: TableCellValueResolver<T, string>;
  iconPosition?: 'start' | 'end';
  color?: PaletteColor;
  size?: ComponentSize;
  animation?: 'none' | 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: TableCellValueResolver<T, string>;
  title?: TableCellValueResolver<T, string>;
  ariaLabel?: TableCellValueResolver<T, string>;
  disabled?: TableCellValueResolver<T, boolean>;
  clases?: TableCellValueResolver<T, string>;
}

export interface TableColumn<T> {
  key: string;
  label?: string;
  icon?: string;
  cssClass?: string;
  align?: TableColumnAlignment;
  headerCssClass?: string;
  formatter?: (value: unknown, row: T) => string;
  /** Renderiza un app-badge si la columna no tiene template. */
  badge?: TableBadgeColumn<T>;
  /** Renderiza un app-status-circle si la columna no tiene template. */
  statusCircle?: TableStatusCircleColumn<T>;
  /** Renderiza un app-type-indicator-ordenes-medicas si la columna no tiene template. */
  typeIndicatorOrdenesMedicas?: TableTypeIndicatorOrdenesMedicasColumn<T>;
  /** Renderiza un app-progress-bars si la columna no tiene template. */
  progressBars?: TableProgressBarsColumn<T>;
  /** Renderiza un app-select si la columna no tiene template. */
  select?: TableSelectColumn<T>;
  /** Renderiza un app-check dentro de la celda. */
  check?: TableBooleanColumn<T>;
  /** Renderiza un app-check-toggle dentro de la celda. */
  checkToggle?: TableBooleanColumn<T>;
  /** Renderiza un app-radio dentro de la celda. */
  radio?: TableRadioColumn<T>;
  /** Renderiza un app-icon-link dentro de la celda. */
  iconLink?: TableIconLinkColumn<T>;
  template?: TemplateRef<TableCellContext<T>>;
  /** Imagen que se muestra antes del valor de la celda. */
  image?: string;
  /** Tamaño de la imagen en píxeles. */
  imageSize?: number;
}

export interface TableRowAction<T> {
  id: string;
  action?: ButtonAction;
  label?: string;
  icon?: string;
  title?: string;
  cssClass?: string;
  color?: PaletteColor;
  variant?: ButtonVariant;
  iconOnly?: boolean;
  outlineHover?: OutlineHover;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export interface TableActionEvent<T> {
  action: string;
  row: T;
}

export interface TableSelectChange<T> {
  column: TableColumn<T>;
  row: T;
  value: string | number | null;
  option: TableSelectOption | null;
}

export interface TableControlChange<T> {
  type: 'check' | 'checkToggle' | 'radio';
  column: TableColumn<T>;
  row: T;
  value: boolean | string | number | null;
}

export interface TableIconLinkClick<T> {
  column: TableColumn<T>;
  row: T;
  event: MouseEvent;
}

export type TableSelectionMode = 'none' | 'checkbox' | 'radio' | 'button';

export interface TableSelectionChange<T> {
  row?: T;
  selected?: boolean;
  selectedKeys: string[];
}

export interface TableSelectionTemplateContext<T> {
  $implicit?: T;
  selected: boolean;
  toggle: (selected: boolean | Event) => void;
}

export type DateInput = DateTime | string | Date | number | null | undefined;
export type DateDifferenceUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';
import type { TemplateRef } from '@angular/core';
import type { DateTime } from 'luxon';
