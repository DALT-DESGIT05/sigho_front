import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingProgressComponent } from './loading-progress.component';

describe('LoadingProgressComponent', () => {
  let fixture: ComponentFixture<LoadingProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoadingProgressComponent] }).compileComponents();
    fixture = TestBed.createComponent(LoadingProgressComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});