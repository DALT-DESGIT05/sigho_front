import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectComponent] }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});