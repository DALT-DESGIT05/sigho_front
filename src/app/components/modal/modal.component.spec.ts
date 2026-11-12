import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EmbeddedViewRef, TemplateRef, signal, viewChild } from '@angular/core';
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

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal #modal [showFooter]="true" [footerEstandar]="estandar()">
      <div modal-footer>
        <button modal-footer-close>Cerrar</button>
        <span>Información</span>
        <button>Guardar</button>
      </div>
    </app-modal>
  `
})
class FooterHostComponent {
  readonly estandar = signal(false);
  readonly modal = viewChild.required<ModalComponent>('modal');
}

describe('ModalComponent standard footer', () => {
  it('keeps the layout optional and projects close, text and actions', async () => {
    let vista_modal: EmbeddedViewRef<unknown> | undefined;
    await TestBed.configureTestingModule({
      imports: [FooterHostComponent],
      providers: [{
        provide: BsModalService,
        useValue: {
          show: (template: TemplateRef<unknown>) => {
            vista_modal = template.createEmbeddedView({});
            vista_modal.detectChanges();
            return { hide: () => undefined };
          }
        }
      }]
    }).compileComponents();

    const fixture = TestBed.createComponent(FooterHostComponent);
    fixture.detectChanges();
    const modal = fixture.componentInstance.modal();
    expect(modal.footer_estandar()).toBe(false);
    modal.open();

    const footer = vista_modal!.rootNodes.find(
      (node: Node) => node instanceof HTMLElement && node.classList.contains('app-modal__footer')
    ) as HTMLElement;
    expect(footer.classList.contains('app-modal__footer--estandar')).toBe(false);

    fixture.componentInstance.estandar.set(true);
    fixture.detectChanges();
    vista_modal!.detectChanges();

    expect(footer.classList.contains('app-modal__footer--estandar')).toBe(true);
    expect(footer.querySelector('[modal-footer]')?.firstElementChild?.hasAttribute('modal-footer-close')).toBe(true);
    expect(footer.textContent).toContain('Información');
    expect(footer.textContent).toContain('Guardar');
    vista_modal!.destroy();
  });
});
