import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSwitcherComponent } from './view-switcher.component';

describe('ViewSwitcherComponent', () => {
  let fixture: ComponentFixture<ViewSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ViewSwitcherComponent] }).compileComponents();
    fixture = TestBed.createComponent(ViewSwitcherComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});