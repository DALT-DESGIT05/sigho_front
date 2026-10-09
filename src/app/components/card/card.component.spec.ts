import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardComponent], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(CardComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits only when click mode is enabled', () => {
    const emitted = vi.fn();
    fixture.componentInstance.clickEvent.subscribe(emitted);

    fixture.componentInstance.onCardClick();
    expect(emitted).not.toHaveBeenCalled();

    fixture.componentRef.setInput('useClick', true);
    fixture.componentInstance.onCardClick();
    expect(emitted).toHaveBeenCalledOnce();
  });
});
