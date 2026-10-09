import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeIndicatorOrdenesMedicasComponent } from './type-indicator-ordenes-medicas.component';

describe('TypeIndicatorOrdenesMedicasComponent', () => {
  let component: TypeIndicatorOrdenesMedicasComponent;
  let fixture: ComponentFixture<TypeIndicatorOrdenesMedicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TypeIndicatorOrdenesMedicasComponent] }).compileComponents();
    fixture = TestBed.createComponent(TypeIndicatorOrdenesMedicasComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('codigoTipo', 2);
    fixture.componentRef.setInput('tipo', 'Laboratorio');
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders the mapped icon, class, size, and preferred text', () => {
    fixture.componentRef.setInput('texto', 'An\u00e1lisis cl\u00ednico');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const icon: HTMLElement = fixture.nativeElement.querySelector('.type-indicator-icon');
    expect(icon.classList).toContain('fa-flask');
    expect(icon.classList).toContain('tipo-laboratorio');
    expect(fixture.nativeElement.querySelector('.type-indicator').classList).toContain('type-indicator-lg');
    expect(fixture.nativeElement.querySelector('.type-indicator-text').textContent.trim()).toBe('An\u00e1lisis cl\u00ednico');
  });
});
