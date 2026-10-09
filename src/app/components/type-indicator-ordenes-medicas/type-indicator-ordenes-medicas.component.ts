import { Component, computed, input } from '@angular/core';
import { ComponentSize } from '../../interfaces/util.interface';

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
    if (codigo === '2') return 'fa-solid fa-flask';
    if (['3', '4', '5', '6', '7'].includes(codigo)) return 'fa-solid fa-image';
    if (codigo === '1') return 'fa-solid fa-stethoscope';
    return 'fa-solid fa-circle-info';
  });
  readonly claseTipo = computed(() => {
    const codigo = String(this.codigoTipo() ?? '');
    if (codigo === '2') return 'tipo-laboratorio';
    if (['3', '4', '5', '6', '7'].includes(codigo)) return 'tipo-imagenes';
    if (codigo === '1') return 'tipo-procedimiento';
    return 'tipo-otro';
  });
}
