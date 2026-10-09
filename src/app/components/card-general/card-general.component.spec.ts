import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardGeneralComponent } from './card-general.component';

describe('CardGeneralComponent', () => {
  let fixture: ComponentFixture<CardGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardGeneralComponent] }).compileComponents();
    fixture = TestBed.createComponent(CardGeneralComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});