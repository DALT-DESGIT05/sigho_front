import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModalComponent], providers: [{ provide: BsModalService, useValue: { show: () => undefined, hide: () => undefined } }] }).compileComponents();
    fixture = TestBed.createComponent(ModalComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});