import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { CatalogoEmergenciaService } from '../../../../../services/emergencia/catalogo-emergencia.service';
import { SignosVitalesHistorialComponent } from './signos-vitales-historial.component';

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(window as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverMock;

describe('SignosVitalesHistorialComponent', () => {
  let fixture: ComponentFixture<SignosVitalesHistorialComponent>;
  let component: SignosVitalesHistorialComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignosVitalesHistorialComponent],
      providers: [
        provideEchartsCore({ echarts }),
        {
          provide: CatalogoEmergenciaService,
          useValue: {
            obtenerSignosVitales: () => of({ data: { parametros: [] } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignosVitalesHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uses the same BMI classification presentation as triage', () => {
    component.peso = '90';
    component.talla = '165';

    expect(component.imc()).toBe('33.06');
    expect(component.imcDescripcion()).toBe('Obesidad grado I');
    expect(component.imcStatus()).toBe('danger');
  });

  it('opens the larger chart modal when clicking the vital signs chart', () => {
    expect(component.modalGraficoVisible()).toBe(false);
    const chartCard = fixture.nativeElement.querySelector('.vitales-grafico-card') as HTMLElement;
    chartCard.click();
    fixture.detectChanges();

    expect(component.modalGraficoVisible()).toBe(true);
  });
});
