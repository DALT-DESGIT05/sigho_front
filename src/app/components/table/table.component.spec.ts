import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('resuelve una imagen de columna por nombre', () => {
    fixture.componentRef.setInput('columns', [{ key: 'nombre', label: 'Nombre', image: 'medico' }]);
    fixture.componentRef.setInput('rows', [{ nombre: 'Profesional' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('images/medico.png');
  });
});
