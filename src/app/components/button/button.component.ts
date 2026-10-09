import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ButtonAction, ButtonActionDefinition, ButtonVariant, ComponentSize, OutlineHover, PaletteColor } from '../../interfaces/util.interface';

const BUTTON_ACTIONS: Record<ButtonAction, ButtonActionDefinition> = {
  save: { text: 'Guardar', icon: 'fa-solid fa-floppy-disk', color: 'primary' },
  update: { text: 'Actualizar', icon: 'fa-solid fa-floppy-disk', color: 'primary' },
  delete: { text: 'Eliminar', icon: 'fa-solid fa-trash', color: 'danger' },
  edit: { text: 'Editar', icon: 'fa-solid fa-pen-to-square', color: 'primary' },
  create: { text: 'Nuevo', icon: 'fa-solid fa-plus', color: 'success' },
  cancel: { text: 'Cancelar', icon: 'fa-solid fa-xmark', color: 'danger' },
  close: { text: 'Cerrar', icon: 'fa-solid fa-xmark', color: 'danger' },
  exit: { text: 'Salir', icon: 'fa-solid fa-right-from-bracket', color: 'danger' },
  search: { text: 'Consultar', icon: 'fa-solid fa-magnifying-glass', color: 'info' },
  view: { text: 'Ver detalle', icon: 'fa-solid fa-eye', color: 'primary' },
  print: { text: 'Imprimir', icon: 'fa-solid fa-print', color: 'fuchsia' },
  download: { text: 'Descargar', icon: 'fa-solid fa-download', color: 'fuchsia' },
  send: { text: 'Enviar', icon: 'fa-solid fa-paper-plane', color: 'primary' },
  clear: { text: 'Limpiar', icon: 'fa-solid fa-broom', color: 'warning' },
  pdf: { text: 'Exportar PDF', icon: 'fa-solid fa-file-pdf', color: 'purple' },
  excel: { text: 'Exportar Excel', icon: 'fa-solid fa-file-excel', color: 'purple' },
};

@Component({ selector: 'app-button', standalone: true, imports: [NgClass], templateUrl: './button.component.html', styleUrl: './button.component.scss' })
export class ButtonComponent {
  readonly texto = input(''); readonly text = input(''); readonly icon = input(''); readonly color = input<PaletteColor>();
  readonly hoverColor = input<PaletteColor>(); readonly size = input<ComponentSize>('md'); readonly variant = input<ButtonVariant>('solid');
  readonly outlineHover = input<OutlineHover>('fill'); readonly type = input<'button' | 'submit' | 'reset'>('button'); readonly disabled = input(false);
  readonly loading = input(false); readonly name = input(''); readonly value = input(''); readonly form = input(''); readonly block = input(false);
  readonly iconOnly = input(false); readonly title = input(''); readonly ariaLabel = input(''); readonly clases = input('');
  readonly showTitle = input(true);
  readonly action = input<ButtonAction | null>(null); readonly accion = input<ButtonAction | null>(null);
  readonly soloIcono = input(false); readonly efectoOutline = input<OutlineHover>();
  readonly clicked = output<MouseEvent>();

  readonly resolvedAction = computed(() => this.accion() ?? this.action());
  readonly definition = computed<ButtonActionDefinition | null>(() => { const action = this.resolvedAction(); return action ? BUTTON_ACTIONS[action] : null; });
  readonly resolvedText = computed(() => this.texto() || this.text() || this.definition()?.text || '');
  readonly resolvedIcon = computed(() => this.icon() || this.definition()?.icon || '');
  readonly resolvedColor = computed<PaletteColor>(() => this.color() ?? this.definition()?.color ?? 'primary');
  readonly resolvedOutlineHover = computed(() => this.efectoOutline() ?? this.outlineHover());
  readonly isIconOnly = computed(() => this.soloIcono() || this.iconOnly());
  readonly resolvedTitle = computed(() => this.title() || this.resolvedText() || this.ariaLabel() || 'Botón');
  readonly resolvedAriaLabel = computed(() => this.ariaLabel() || this.resolvedTitle());
  readonly buttonClasses = computed(() => [
    'app-button--' + this.variant(),
    this.variant() === 'outline' && this.resolvedOutlineHover() === 'border' ? 'app-button--outline-border-hover' : '',
    'app-button--' + this.resolvedColor(), 'app-button--' + this.size(),
    this.hoverColor() ? 'app-button--hover-' + this.hoverColor() : '', this.clases(),
  ]);

  onClick(event: MouseEvent): void { if (!this.disabled() && !this.loading()) this.clicked.emit(event); }
}
