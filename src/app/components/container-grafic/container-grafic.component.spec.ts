import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as echarts from 'echarts';
import { provideEchartsCore } from 'ngx-echarts';

import { ContainerGraficComponent } from './container-grafic.component';

describe('ContainerGraficComponent', () => {
  let fixture: ComponentFixture<ContainerGraficComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerGraficComponent],
      providers: [provideEchartsCore({ echarts })],
    }).compileComponents();
    fixture = TestBed.createComponent(ContainerGraficComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
