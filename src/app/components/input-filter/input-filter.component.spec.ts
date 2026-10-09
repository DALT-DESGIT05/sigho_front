import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFilterComponent } from './input-filter.component';

describe('InputFilterComponent', () => {
  let fixture: ComponentFixture<InputFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputFilterComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputFilterComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});