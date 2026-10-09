import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextComponent } from './input-text.component';

describe('InputTextComponent', () => {
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputTextComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputTextComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});