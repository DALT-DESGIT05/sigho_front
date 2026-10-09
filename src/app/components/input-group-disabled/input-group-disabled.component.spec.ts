import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputGroupDisabledComponent } from './input-group-disabled.component';

describe('InputGroupDisabledComponent', () => {
  let fixture: ComponentFixture<InputGroupDisabledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputGroupDisabledComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputGroupDisabledComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});