import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

export interface BreadcrumbItem {
  label: string;
  /** Ruta interna de Angular. */
  link?: string | unknown[];
  /** URL externa. Tiene prioridad sobre `link`. */
  href?: string;
  icon?: string;
  color?: PaletteColor;
  active?: boolean;
  title?: string;
}

export type BreadcrumbSeparator = '/' | '>' | '|' | '•' | string;

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  readonly items = input<BreadcrumbItem[]>([]);
  readonly size = input<ComponentSize>('md');
  /** Separador de texto. Se usa `/` si no se configura. */
  readonly separator = input<BreadcrumbSeparator>('/');
  /** Clase de icono para el separador, por ejemplo `fa-solid fa-chevron-right`. */
  readonly separatorIcon = input('');
  readonly ariaLabel = input('Migas de pan');

  itemColor(item: BreadcrumbItem): PaletteColor {
    return item.color ?? 'primary';
  }

  isActive(item: BreadcrumbItem, index: number): boolean {
    return item.active ?? index === this.items().length - 1;
  }
}
