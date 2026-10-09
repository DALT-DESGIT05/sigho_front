import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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
});
