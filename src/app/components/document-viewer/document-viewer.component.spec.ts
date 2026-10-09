import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewerComponent } from './document-viewer.component';

describe('DocumentViewerComponent', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DocumentViewerComponent] }).compileComponents();
    fixture = TestBed.createComponent(DocumentViewerComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});