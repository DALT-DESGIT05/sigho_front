import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputGroupComponent } from './input-group.component';

describe('InputGroupComponent', () => {
  let fixture: ComponentFixture<InputGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputGroupComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputGroupComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});