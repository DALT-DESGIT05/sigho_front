import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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
});
