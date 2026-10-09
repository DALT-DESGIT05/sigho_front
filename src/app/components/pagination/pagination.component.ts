import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Links,  PaginationMeta } from '../../interfaces/response.interface';
import { ComponentSize } from '../../interfaces/util.interface';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly links = input<Links[]>([]);
  readonly size = input<ComponentSize>('md');
  readonly page = input<PaginationMeta | null>(null);
  readonly pageChange = output<string>();

  readonly resumen = computed(() => {
    const page = this.page();
    if (!page || page.total === 0) return null;

    const from = page.from || ((page.current_page - 1) * page.per_page) + 1;
    const to = page.to || Math.min(page.current_page * page.per_page, page.total);
    return { from, to, total: page.total, currentPage: page.current_page, lastPage: page.last_page, perPage: page.per_page };
  });
  readonly items = computed(() => this.links().map((link) => ({
    ...link,
    text: this.getLabel(link.label),
  })));

  changePage(link: Links): void {
    if (link.url) {
      this.pageChange.emit(link.url);
    }
  }

  private getLabel(label: string): string {
    const text = label.replace(/<[^>]*>/g, '').replace(/&laquo;/g, '').replace(/&raquo;/g, '').trim();

    if (/anterior/i.test(text)) return String.fromCharCode(171);
    if (/siguiente/i.test(text)) return String.fromCharCode(187);
    return text;
  }
}
