import { TestBed } from '@angular/core/testing';
import { CardResumenItemComponent } from './card-resumen-item.component';

describe('CardResumenItemComponent', () => {
  it('keeps compact mobile layout opt-in and preserves the displayed data', async () => {
    await TestBed.configureTestingModule({
      imports: [CardResumenItemComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(CardResumenItemComponent);
    fixture.componentRef.setInput('titulo', 'Programaciones');
    fixture.componentRef.setInput('valor', '2');
    fixture.componentRef.setInput('variante', 'programacion-total');
    fixture.detectChanges();

    const article: HTMLElement = fixture.nativeElement.querySelector('article');
    expect(article.classList.contains('resumen-item--compacto-movil')).toBe(false);

    fixture.componentRef.setInput('compactoEnMovil', true);
    fixture.detectChanges();

    expect(article.classList.contains('resumen-item--compacto-movil')).toBe(true);
    expect(article.textContent).toContain('Programaciones');
    expect(article.textContent).toContain('2');
  });
});
