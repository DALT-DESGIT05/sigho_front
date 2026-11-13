import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { RouterLink } from '@angular/router';
import { MenuFlotanteOption } from './menu-flotante-option.interface';

@Component({
  selector: 'app-menu-flotante',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu-flotante.component.html',
  styleUrl: './menu-flotante.component.scss',
})
export class MenuFlotanteComponent {
  readonly opciones = input<MenuFlotanteOption[]>([]);
  readonly titulo = input('Registro / consulta');
  readonly subtitulo = input('Acciones disponibles');
  readonly abierto = input(true);
  readonly visible = input(true);
  readonly topOffset = input('70px');
  readonly sidebarWidth = input('260px');
  readonly bottomOffset = input('65px');
  readonly mostrarBotonColapsar = input(true);
  readonly codigo = input('');
  readonly etiqueta = input('');
  readonly iconoCabecera = input('fa-solid fa-notes-medical');
  readonly seleccionar = output<string>();
  readonly cambioApertura = output<boolean>();

  private readonly sidebarService = inject(SidebarService);
  protected readonly estaAbierto = signal(true);
  protected readonly sidebarOculto = computed(() => this.sidebarService.isCollapsed());

  constructor() {
    effect(() => this.setAbierto(this.abierto(), false));
  }

  seleccionarOpcion(opcion: MenuFlotanteOption): void {
    if (opcion.disabled || opcion.visible === false) return;
    this.seleccionar.emit(opcion.id);
  }

  alternar(): void {
    this.setAbierto(!this.estaAbierto(), true);
  }

  private setAbierto(abierto: boolean, emitir: boolean): void {
    if (this.estaAbierto() === abierto) return;
    this.estaAbierto.set(abierto);
    if (emitir) this.cambioApertura.emit(abierto);
  }
}
