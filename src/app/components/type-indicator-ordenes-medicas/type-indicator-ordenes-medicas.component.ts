import { Component, computed, input } from '@angular/core';
import { ComponentSize } from '../../interfaces/util.interface';

export const TIPO_ORDEN_PROCEDIMIENTO = '1';
export const TIPO_ORDEN_LABORATORIO = '2';
export const TIPOS_ORDEN_IMAGENES = ['3', '4', '5', '6', '7'] as const;

@Component({
  selector: 'app-type-indicator-ordenes-medicas',
  standalone: true,
  templateUrl: './type-indicator-ordenes-medicas.component.html',
  styleUrl: './type-indicator-ordenes-medicas.component.scss',
})
export class TypeIndicatorOrdenesMedicasComponent {
  readonly tipo = input<string>('');
  readonly texto = input<string>('');
  readonly size = input<ComponentSize>('md');
  readonly codigoTipo = input<string | number | null>(null);

  readonly textoMostrar = computed(() => this.texto() || this.tipo() || '-');

  readonly icono = computed(() => {
    const codigo = String(this.codigoTipo() ?? '');
    if (codigo === TIPO_ORDEN_LABORATORIO) return 'fa-solid fa-flask';
    if ((TIPOS_ORDEN_IMAGENES as readonly string[]).includes(codigo)) return 'fa-solid fa-image';
    if (codigo === TIPO_ORDEN_PROCEDIMIENTO) return 'fa-solid fa-stethoscope';
    return 'fa-solid fa-circle-info';
  });

  readonly claseTipo = computed(() => {
    const codigo = String(this.codigoTipo() ?? '');
    if (codigo === TIPO_ORDEN_LABORATORIO) return 'tipo-laboratorio';
    if ((TIPOS_ORDEN_IMAGENES as readonly string[]).includes(codigo)) return 'tipo-imagenes';
    if (codigo === TIPO_ORDEN_PROCEDIMIENTO) return 'tipo-procedimiento';
    return 'tipo-otro';
  });
}
