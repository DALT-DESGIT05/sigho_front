import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCardComponent } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let fixture: ComponentFixture<SummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SummaryCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(SummaryCardComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});