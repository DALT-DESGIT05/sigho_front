import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBarsComponent } from './progress-bars.component';

describe('ProgressBarsComponent', () => {
  let fixture: ComponentFixture<ProgressBarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProgressBarsComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProgressBarsComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});