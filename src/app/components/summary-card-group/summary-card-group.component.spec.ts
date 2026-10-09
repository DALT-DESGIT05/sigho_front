import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCardGroupComponent } from './summary-card-group.component';

describe('SummaryCardGroupComponent', () => {
  let fixture: ComponentFixture<SummaryCardGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SummaryCardGroupComponent] }).compileComponents();
    fixture = TestBed.createComponent(SummaryCardGroupComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});