import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSimpleComponent } from './table-simple.component';

describe('TableSimpleComponent', () => {
  let fixture: ComponentFixture<TableSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TableSimpleComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableSimpleComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});