import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPersonaComponent } from './card-persona.component';

describe('CardPersonaComponent', () => {
  let fixture: ComponentFixture<CardPersonaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CardPersonaComponent] }).compileComponents();
    fixture = TestBed.createComponent(CardPersonaComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});