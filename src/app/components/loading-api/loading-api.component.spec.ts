import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { LoadingApiComponent } from './loading-api.component';
import { LoadingService } from '../../services/loading.service';

describe('LoadingApiComponent', () => {
  let fixture: ComponentFixture<LoadingApiComponent>;
  const activo = signal(false);

  beforeEach(async () => {
    activo.set(false);
    await TestBed.configureTestingModule({
      imports: [LoadingApiComponent],
      providers: [{ provide: LoadingService, useValue: { activo } }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoadingApiComponent);
  });

  it('renders only while the loading service is active', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading-api')).toBeNull();

    activo.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-api')).not.toBeNull();
  });

  it('renders its configured message', () => {
    fixture.componentRef.setInput('message', 'Guardando datos...');
    activo.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.loading-api__content span').textContent.trim()).toBe('Guardando datos...');
  });
});
