import { Component, computed, input, output, signal } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  readonly tabs = input.required<readonly TabItem[]>();
  readonly activeTabId = input<string | null>(null);
  readonly tabSelected = output<string>();

  private readonly selectedTabId = signal<string | null>(null);
  readonly variant = input<'tabs' | 'stepper'>('tabs');
  readonly completedTabIds = input<readonly string[]>([]);

  readonly activeId = computed(() => {
    const activeTabId = this.activeTabId();

    if (activeTabId && this.isEnabled(activeTabId)) {
      return activeTabId;
    }

    const selectedTabId = this.selectedTabId();

    if (selectedTabId && this.isEnabled(selectedTabId)) {
      return selectedTabId;
    }

    return this.tabs().find((tab) => !tab.disabled)?.id ?? null;
  });

  selectTab(tab: TabItem): void {
    if (tab.disabled) {
      return;
    }

    this.selectedTabId.set(tab.id);
    this.tabSelected.emit(tab.id);
  }

  private isEnabled(tabId: string): boolean {
    return this.tabs().some((tab) => tab.id === tabId && !tab.disabled);
  }
}
