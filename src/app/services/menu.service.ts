import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MenuFormularioApi, MenuItem, MenuModuloApi } from '../interfaces/menu.interface';

const FALLBACK_MENU_ICON = 'fa fa-exclamation-triangle';

const MODULE_ICONS: Record<string, string> = {
  '1': 'fa fa-desktop',
  '2': 'fa fa-calendar',
  '3': 'fa fa-stethoscope',
  '4': 'fa fa-ambulance',
  '9': 'fa fa-database',
  '10': 'fa fa-cogs',
  '11': 'fa fa-credit-card-alt',
  '12': 'fa fa-bar-chart',
};

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuCache: MenuItem[] | null = null;

  loadMenu(): Observable<MenuItem[]> {
    if (this.menuCache?.length) {
      return of(this.menuCache);
    }

    return this.fetchAndCache();
  }

  fetchAndCache(): Observable<MenuItem[]> {
    this.menuCache = [];
    return of([]);
  }

  clearMenu(): void {
    this.menuCache = null;
  }

  getFirstMenuLink(items: MenuItem[]): string | null {
    for (const item of items) {
      const link = item.link?.trim();

      if (link) {
        return link;
      }

      if (item.children?.length) {
        const childLink = this.getFirstMenuLink(item.children);

        if (childLink) {
          return childLink;
        }
      }
    }

    return null;
  }

  private saveMenu(menu: MenuItem[]): void {
    this.menuCache = menu;
  }

  private menuItemsResponse(data: unknown): MenuItem[] {
    return this.normalizeMenuResponse(data);
  }

  private normalizeMenuResponse(data: unknown): MenuItem[] {
    if (!Array.isArray(data) || !data.length) {
      return [];
    }

    const firstItem = data[0] as Record<string, unknown>;

    if (firstItem['nombre_modulo'] && Array.isArray(firstItem['formularios'])) {
      return this.normalizeModulos(data as MenuModuloApi[]);
    }

    return this.normalizeLegacyMenuItems(data);
  }

  private normalizeModulos(modulos: MenuModuloApi[]): MenuItem[] {
    return modulos
      .map((modulo) => this.normalizeModulo(modulo))
      .filter((item): item is MenuItem => item !== null);
  }

  private normalizeModulo(modulo: MenuModuloApi): MenuItem | null {
    const children = (modulo.formularios ?? [])
      .filter((formulario) => this.hasAccess(formulario.privilegio))
      .map((formulario) => this.normalizeFormulario(formulario));

    if (!children.length) {
      return null;
    }

    return {
      id_modulo: String(modulo.id_modulo),
      label: this.cleanLabel(modulo.nombre_modulo),
      icon: this.normalizeIcon(modulo.icon ?? modulo.icono, this.getModuleIcon(modulo.id_modulo)),
      children
    };
  }

  private normalizeFormulario(formulario: MenuFormularioApi): MenuItem {
    const rawChildren = formulario.children
      ?? formulario.submenus
      ?? formulario.sub_formularios
      ?? formulario.hijos
      ?? formulario.formularios;
    const children = Array.isArray(rawChildren) && rawChildren.length
      ? rawChildren
          .filter((child) => this.hasAccess(child.privilegio))
          .map((child) => this.normalizeFormulario(child))
      : undefined;

    return {
      id_formulario: String(formulario.id_formulario),
      label: this.cleanLabel(formulario.nombre_formulario),
      // 🔹 Cambiado para conservar la propiedad en el objeto pase lo que pase
      link: this.normalizeLink(formulario.url ?? formulario.link ?? formulario.ruta),
      icon: this.normalizeIcon(formulario.icon ?? formulario.icono, children?.length ? 'fa fa-folder-o' : 'fa fa-file-text-o'),
      children
    };
  }

  private normalizeLegacyMenuItems(items: unknown[]): MenuItem[] {
    return items
      .map((item) => this.normalizeLegacyMenuItem(item))
      .filter((item): item is MenuItem => !!item.label);
  }

  private normalizeLegacyMenuItem(item: unknown): MenuItem {
    const source = (item ?? {}) as Record<string, unknown>;
    const rawChildren = source['children'] ?? source['submenus'] ?? source['sub_formularios'] ?? source['hijos'];
    const children = Array.isArray(rawChildren) && rawChildren.length
      ? this.normalizeLegacyMenuItems(rawChildren)
      : undefined;

    return {
      id_modulo: source['id_modulo'] ? String(source['id_modulo']) : undefined,
      id_formulario: source['id_formulario'] ? String(source['id_formulario']) : undefined,
      label: String(source['label'] ?? source['nombre'] ?? source['descripcion'] ?? ''),
      link: this.normalizeLink(source['link'] ?? source['url'] ?? source['ruta']),
      icon: this.normalizeIcon(source['icon'] ?? source['icono'], 'fa fa-circle'),
      children
    };
  }

  private cleanLabel(label: string): string {
    return label?.trim() ?? '';
  }

  private hasAccess(privilegio: string | null): boolean {
    return !privilegio || privilegio.toUpperCase() === 'T';
  }

  private getModuleIcon(idModulo: string): string {
    return MODULE_ICONS[idModulo] ?? 'fa fa-folder-open';
  }

  private normalizeIcon(icon: unknown, fallback: string): string {
    const value = String(icon ?? '').trim();
    const safeFallback = this.isFontAwesomeIcon(fallback) ? fallback : FALLBACK_MENU_ICON;

    if (!value) {
      return safeFallback;
    }

    if (this.isFontAwesomeIcon(value)) {
      return value;
    }

    if (/^fa-[a-z0-9-]+$/i.test(value)) {
      return `fa ${value}`;
    }

    return FALLBACK_MENU_ICON;
  }

  private isFontAwesomeIcon(icon: string): boolean {
    return /(^|\s)(fa|fas|far|fal|fab|fad|fass|fasr|fasl|fat|fa-solid|fa-regular|fa-light|fa-thin|fa-brands|fa-duotone)(\s|$)/i.test(icon)
      && /(^|\s)fa-[a-z0-9-]+(\s|$)/i.test(icon);
  }

  // 🔹 Modificado para que no purgue la propiedad al serializar con JSON.stringify
  private normalizeLink(link: unknown): string | undefined {
    if (link === null || link === undefined || link === '') {
      return ''; // Retornamos un string vacío en vez de undefined para forzar el guardado
    }

    return String(link);
  }
}
