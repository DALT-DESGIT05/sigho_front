import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientIdentityComponent } from './patient-identity.component';

describe('PatientIdentityComponent', () => {
  let fixture: ComponentFixture<PatientIdentityComponent>;
  let http_testing: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientIdentityComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(PatientIdentityComponent);
    http_testing = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http_testing
      .match(() => true)
      .forEach((request) => request.flush(null, { status: 404, statusText: 'Not Found' }));
    http_testing.verify();
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the kinship next to the patient name', () => {
    fixture.componentRef.setInput('identificador', '123');
    fixture.componentRef.setInput('nombre', 'PEREZ, JUAN');
    fixture.componentRef.setInput('parentesco', 'TITULAR');
    fixture.detectChanges();

    const kinship = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__kinship',
    );

    expect(kinship?.textContent?.trim()).toBe('TITULAR');
  });

  it('omits the kinship when it is not available', () => {
    fixture.componentRef.setInput('identificador', '123');
    fixture.componentRef.setInput('nombre', 'PEREZ, JUAN');
    fixture.detectChanges();

    const kinship = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__kinship',
    );

    expect(kinship).toBeNull();
  });
});