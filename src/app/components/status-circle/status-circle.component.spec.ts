import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusCircleComponent } from './status-circle.component';

describe('StatusCircleComponent', () => {
  let fixture: ComponentFixture<StatusCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusCircleComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatusCircleComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});