import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionCardComponent } from './selection-card.component';

describe('SelectionCardComponent', () => {
  let fixture: ComponentFixture<SelectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectionCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(SelectionCardComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});