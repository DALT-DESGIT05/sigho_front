import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { Last_activity_component } from './last-activity.component';
import { AuthService } from '../../services/auth/auth.service';

describe('Last_activity_component', () => {
  let component: Last_activity_component;
  let fixture: ComponentFixture<Last_activity_component>;
  const lastActivity = signal<string | null>(null);

  beforeEach(async () => {
    lastActivity.set(null);
    await TestBed.configureTestingModule({
      imports: [Last_activity_component],
      providers: [{ provide: AuthService, useValue: { b_last_activity: lastActivity } }],
    }).compileComponents();
    fixture = TestBed.createComponent(Last_activity_component);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  it('renders relative time and the source timestamp', () => {
    const timestamp = new Date(Date.now() - (2 * 60 * 1000) - 1_000).toISOString();
    lastActivity.set(timestamp);
    fixture.detectChanges();

    const activity: HTMLElement = fixture.nativeElement.querySelector('.last-activity');
    expect(activity.textContent?.trim()).toBe('Activo hace 2 min');
    expect(activity.title).toBe(timestamp);
  });

  it('does not render when no activity has been registered', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.last-activity')).toBeNull();
  });
});
