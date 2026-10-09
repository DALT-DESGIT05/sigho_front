import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

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

  it('renders derived patient data and emits the phone update action', () => {
    const emitted = vi.fn();
    fixture.componentInstance.phoneUpdate.subscribe(emitted);
    fixture.componentRef.setInput('patient', { paciente: 'Ana', edad: 30, telefono: '999999999' });
    fixture.componentRef.setInput('showPhone', true);
    fixture.componentRef.setInput('allowPhoneUpdate', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('strong').textContent.trim()).toBe('Ana');
    expect(fixture.nativeElement.textContent).toContain('30 a\u00f1os');
    (fixture.nativeElement.querySelector('.patient-summary__action') as HTMLButtonElement).click();
    expect(emitted).toHaveBeenCalledOnce();
  });
});
