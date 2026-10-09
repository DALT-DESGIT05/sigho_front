import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIdentityComponent } from './patient-identity.component';

describe('PatientIdentityComponent', () => {
  let fixture: ComponentFixture<PatientIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PatientIdentityComponent] }).compileComponents();
    fixture = TestBed.createComponent(PatientIdentityComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});