import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogoEmergenciaService } from '../../../../../services/emergencia/catalogo-emergencia.service';
import { SignosVitalesHistorialComponent } from './signos-vitales-historial.component';

describe('SignosVitalesHistorialComponent', () => {
  let fixture: ComponentFixture<SignosVitalesHistorialComponent>;
  let component: SignosVitalesHistorialComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignosVitalesHistorialComponent],
      providers: [
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
    component.abrir_modal();
    component.peso = '90';
    component.talla = '165';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const classification = element.querySelector('.imc-classification__value');

    expect(element.querySelector('.imc-control')).not.toBeNull();
    expect(element.textContent).toContain('Índice de Masa Corporal (IMC)');
    expect(element.textContent).toContain('Clasificación IMC');
    expect(classification?.textContent?.trim()).toBe('Obesidad grado I');
    expect(classification?.classList.contains('imc-classification__value--danger')).toBe(true);
    expect(element.querySelector('.imc-control app-alert')).toBeNull();
    expect(element.querySelector('.imc-control app-progress-bars')).toBeNull();
  });
});
