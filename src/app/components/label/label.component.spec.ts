import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelComponent } from './label.component';

describe('LabelComponent', () => {
  let fixture: ComponentFixture<LabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelComponent] }).compileComponents();
    fixture = TestBed.createComponent(LabelComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});