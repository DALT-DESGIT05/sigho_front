import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  readonly isCollapsed = signal(false);

  toggle(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  setCollapsed(collapsed: boolean): void {
    this.isCollapsed.set(collapsed);
  }
}
