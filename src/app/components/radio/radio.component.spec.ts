import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioComponent } from './radio.component';

describe('RadioComponent', () => {
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RadioComponent] }).compileComponents();
    fixture = TestBed.createComponent(RadioComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});