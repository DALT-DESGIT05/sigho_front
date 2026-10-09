import { Component, computed, input, output } from '@angular/core';
import { PaletteColor, TableColumn } from '../../interfaces/util.interface';
import { ButtonComponent } from '../button/button.component';
import { TableComponent } from '../table/table.component';

@Component({
  selector: 'app-side-table',
  standalone: true,
  imports: [ButtonComponent, TableComponent],
  templateUrl: './side-table.component.html',
  styleUrl: './side-table.component.scss',
})
export class SideTableComponent<T extends object = object> {
  readonly title = input('Detalle');
  readonly rows = input<T[]>([]);
  readonly columns = input<TableColumn<T>[]>([]);
  readonly loading = input(false);
  readonly emptyMessage = input('No se encontraron resultados');
  readonly tableHeight = input('24rem');
  /** Alto total del panel. Si se indica, la tabla ocupa el espacio restante tras la cabecera. */
  readonly height = input<string | null>(null);

  /** Configuraci\u00f3n visual del bot\u00f3n que solicita la exportaci\u00f3n. */
  readonly showExport = input(true);
  readonly exportLabel = input('Exportar Excel');
  readonly exportIcon = input('fa-solid fa-file-excel');
  readonly exportColor = input<PaletteColor>('purple');
  readonly exportDisabled = input(false);

  readonly exportRequested = output<void>();
  readonly resolvedTableHeight = computed(() => this.height() ? '100%' : this.tableHeight());
  readonly isExportDisabled = computed(() => this.exportDisabled() || this.rows().length === 0);
}
