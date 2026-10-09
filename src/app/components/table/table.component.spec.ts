import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});