import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AlertComponent] }).compileComponents();
    fixture = TestBed.createComponent(AlertComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});