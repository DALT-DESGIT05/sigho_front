import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewerBookComponent } from './document-viewer-book.component';

describe('DocumentViewerBookComponent', () => {
  let fixture: ComponentFixture<DocumentViewerBookComponent>;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({ matches: false, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }),
    });
    await TestBed.configureTestingModule({ imports: [DocumentViewerBookComponent] }).compileComponents();
    fixture = TestBed.createComponent(DocumentViewerBookComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
