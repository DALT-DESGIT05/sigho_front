import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDateComponent } from './input-date.component';

describe('InputDateComponent', () => {
  let fixture: ComponentFixture<InputDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputDateComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputDateComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});