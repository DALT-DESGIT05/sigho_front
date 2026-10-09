import { Component, input } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective } from 'ngx-echarts';

@Component({
  selector: 'app-container-grafic',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './container-grafic.component.html',
  styleUrl: './container-grafic.component.scss',
})
export class ContainerGraficComponent {
  readonly options = input.required<EChartsOption>();
  readonly loading = input(false);
  readonly height = input('24rem');
}
