import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconLinkComponent } from './icon-link.component';

describe('IconLinkComponent', () => {
  let fixture: ComponentFixture<IconLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IconLinkComponent] }).compileComponents();
    fixture = TestBed.createComponent(IconLinkComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});