import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDropComponent } from './file-drop.component';

describe('FileDropComponent', () => {
  let fixture: ComponentFixture<FileDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FileDropComponent] }).compileComponents();
    fixture = TestBed.createComponent(FileDropComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});