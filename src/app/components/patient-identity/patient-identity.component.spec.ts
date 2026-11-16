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

  it('renders special condition badges with info styling after kinship', () => {
    fixture.componentRef.setInput('identificador', '123');
    fixture.componentRef.setInput('nombre', 'PEREZ, JUAN');
    fixture.componentRef.setInput('parentesco', 'TITULAR');
    fixture.componentRef.setInput('hcNsa', 'HC - 3453A');
    fixture.componentRef.setInput('condicionesEspeciales', [
      'DISCAPACITADO',
      'DEFENSOR DE LA PATRIA',
    ]);
    fixture.detectChanges();

    const kinship = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__kinship',
    );
    const hcBadge = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__hc-badge',
    );
    const badges = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.app-patient-identity__special-badge',
    );

    expect(kinship?.textContent?.trim()).toBe('TITULAR');
    expect(hcBadge?.textContent?.trim()).toBe('HC - 3453A');
    expect(badges.length).toBe(2);
    expect(badges[0].textContent?.trim()).toBe('DISCAPACITADO');
    expect(badges[1].textContent?.trim()).toBe('DEFENSOR DE LA PATRIA');
  });

  it('renders nsaLetra and affiliation badge when provided', () => {
    fixture.componentRef.setInput('identificador', '123');
    fixture.componentRef.setInput('nombre', 'ARGOMEDO, YRVING');
    fixture.componentRef.setInput('parentesco', 'TITULAR');
    fixture.componentRef.setInput('nsaLetra', '609765A');
    fixture.componentRef.setInput('mostrarAfiliacion', true);
    fixture.componentRef.setInput('codSitu', 1);
    fixture.detectChanges();

    const nsaBadge = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__hc-badge',
    );
    const affiliationBadge = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__affiliation',
    );

    expect(nsaBadge?.textContent?.trim()).toBe('609765A');
    expect(affiliationBadge?.textContent?.trim()).toBe('AFILIADO');
    expect(affiliationBadge?.classList.contains('app-patient-identity__affiliation--active')).toBe(true);
  });

  it('renders NO AFILIADO badge when patient is not affiliated', () => {
    fixture.componentRef.setInput('identificador', '123');
    fixture.componentRef.setInput('nombre', 'PEREZ, JUAN');
    fixture.componentRef.setInput('parentesco', 'TITULAR');
    fixture.componentRef.setInput('mostrarAfiliacion', true);
    fixture.componentRef.setInput('codSitu', 3);
    fixture.detectChanges();

    const affiliationBadge = (fixture.nativeElement as HTMLElement).querySelector(
      '.app-patient-identity__affiliation',
    );

    expect(affiliationBadge?.textContent?.trim()).toBe('NO AFILIADO');
    expect(affiliationBadge?.classList.contains('app-patient-identity__affiliation--inactive')).toBe(true);
  });
});
