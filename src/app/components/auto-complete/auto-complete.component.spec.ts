import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompleteComponent } from './auto-complete.component';

describe('AutoCompleteComponent', () => {
  let fixture: ComponentFixture<AutoCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AutoCompleteComponent] }).compileComponents();
    fixture = TestBed.createComponent(AutoCompleteComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});