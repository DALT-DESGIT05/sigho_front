import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CardIpressComponent } from './card-ipress.component';

describe('CardIpressComponent', () => {
  let fixture: ComponentFixture<CardIpressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardIpressComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(CardIpressComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits only when click mode is enabled', () => {
    const emitted = vi.fn();
    fixture.componentInstance.clickEvent.subscribe(emitted);

    fixture.componentRef.setInput('useClick', true);
    fixture.componentInstance.onCardClick();

    expect(emitted).toHaveBeenCalledOnce();
  });
});
