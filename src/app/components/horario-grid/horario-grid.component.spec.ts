import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioGridComponent } from './horario-grid.component';

describe('HorarioGridComponent', () => {
  let fixture: ComponentFixture<HorarioGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HorarioGridComponent] }).compileComponents();
    fixture = TestBed.createComponent(HorarioGridComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});