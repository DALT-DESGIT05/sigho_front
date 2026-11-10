import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramacionPersonalComponent } from './programacion-personal.component';

describe('ProgramacionPersonalComponent', () => {
  let fixture: ComponentFixture<ProgramacionPersonalComponent>;
  let component: ProgramacionPersonalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgramacionPersonalComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProgramacionPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes Signal Forms models with the current filters and morning shift', () => {
    expect(component.filtros_model().periodo).toMatch(/^\d{4}-\d{2}$/);
    expect(component.asignacion_model()).toEqual({ turnoId: 1, observacion: '' });
    expect(component.asignacion_form().valid()).toBe(true);
  });

  it('synchronizes a filter field through the shared input binding', async () => {
    const input = fixture.nativeElement.querySelector('.filters app-input-text input') as HTMLInputElement;
    input.value = 'Mariana';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.filtros_model().busqueda).toBe('Mariana');
    expect(component.personalFiltrado()).toHaveLength(1);
  });

  it('does not save an assignment without a shift', () => {
    const saveSpy = vi.spyOn(component.horarioService, 'guardarProgramacion');
    component.abrirAsignacion(1, `${component.filtros_model().periodo}-01`);
    component.asignacion_model.set({ turnoId: null, observacion: 'Sin turno' });

    component.guardarAsignacion();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('saves a valid assignment through the mock service', () => {
    const saveSpy = vi.spyOn(component.horarioService, 'guardarProgramacion');
    const fecha = `${component.filtros_model().periodo}-01`;
    component.abrirAsignacion(1, fecha);
    component.asignacion_model.set({ turnoId: 2, observacion: 'Cobertura' });

    component.guardarAsignacion();

    expect(saveSpy).toHaveBeenCalledWith(1, fecha, 2, 'Cobertura');
    expect(component.aviso()).toContain('borrador');
  });
});
