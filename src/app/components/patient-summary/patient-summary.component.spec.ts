import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSummaryComponent } from './patient-summary.component';

describe('PatientSummaryComponent', () => {
  let fixture: ComponentFixture<PatientSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PatientSummaryComponent] }).compileComponents();
    fixture = TestBed.createComponent(PatientSummaryComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});