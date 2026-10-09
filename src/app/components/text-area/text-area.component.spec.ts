import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAreaComponent } from './text-area.component';

describe('TextAreaComponent', () => {
  let fixture: ComponentFixture<TextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextAreaComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextAreaComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});