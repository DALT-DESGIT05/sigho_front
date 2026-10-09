import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckToggleComponent } from './check-toggle.component';

describe('CheckToggleComponent', () => {
  let fixture: ComponentFixture<CheckToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(CheckToggleComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});