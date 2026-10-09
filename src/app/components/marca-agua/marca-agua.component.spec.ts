import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcaAguaComponent } from './marca-agua.component';

describe('MarcaAguaComponent', () => {
  let fixture: ComponentFixture<MarcaAguaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MarcaAguaComponent] }).compileComponents();
    fixture = TestBed.createComponent(MarcaAguaComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});