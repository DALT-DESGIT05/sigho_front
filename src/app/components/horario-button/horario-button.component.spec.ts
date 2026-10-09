import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioButtonComponent } from './horario-button.component';

describe('HorarioButtonComponent', () => {
  let fixture: ComponentFixture<HorarioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HorarioButtonComponent] }).compileComponents();
    fixture = TestBed.createComponent(HorarioButtonComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});