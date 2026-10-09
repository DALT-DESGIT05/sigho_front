import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ComponentSize } from '../../interfaces/util.interface';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  readonly texto = input.required<string | null | undefined>();
  readonly clases = input.required<string | null | undefined>();
  readonly title = input('');
  readonly size = input<ComponentSize>('md');

  readonly shouldRender = computed(() => {
    const texto = String(this.texto() ?? '').trim();
    const clases = String(this.clases() ?? '').trim();

    return !!texto && !!clases;
  });

}
