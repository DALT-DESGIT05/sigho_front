import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideTableComponent } from './side-table.component';

describe('SideTableComponent', () => {
  let fixture: ComponentFixture<SideTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SideTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(SideTableComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});