import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AfiliadoService } from '../../services/citas/afiliado.service';

import { FichaAfiliadoComponent } from './ficha-afiliado.component';

describe('FichaAfiliadoComponent', () => {
  let fixture: ComponentFixture<FichaAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FichaAfiliadoComponent], providers: [{ provide: AfiliadoService, useValue: { ficha_afiliado: () => of({ data: null }) } }] }).compileComponents();
    fixture = TestBed.createComponent(FichaAfiliadoComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
