import {
  Component,
  DestroyRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ButtonComponent } from '../button/button.component';
import { ModalSize } from '../../interfaces/util.interface';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent {
  readonly title = input('');
  readonly titulo = input('');
  /** Ícono Font Awesome opcional que se muestra antes del título. */
  readonly icon = input('');
  readonly size = input<ModalSize>('md');
  readonly centered = input(true);
  readonly scrollable = input(false);
  readonly keyboard = input(true);
  readonly ignoreBackdropClick = input(false);
  readonly showCloseButton = input(true);
  readonly showFooter = input(false);
  /** Permite que el alto del modal se ajuste a su contenido. */
  readonly fitContent = input(false);
  /** Oscurece el modal que queda detrás cuando este modal se abre encima de otro. */
  readonly separateFromParent = input(false);

  readonly opened = output<void>();
  readonly closed = output<void>();

  private readonly destroy_ref = inject(DestroyRef);
  private readonly modalService = inject(BsModalService);
  private readonly modalTemplate = viewChild<TemplateRef<unknown>>('modalTemplate');
  modalRef?: BsModalRef;
  readonly headerDestacado = input(false);

  readonly resolvedTitle = computed(() => this.titulo() || this.title());
  readonly modalDialogClasses = computed(() => {
    const classes = [this.sizeClass()];
    if (this.centered()) classes.push('modal-dialog-centered');
    if (this.scrollable()) classes.push('modal-dialog-scrollable');
    if (this.separateFromParent()) classes.push('app-modal--separated');
    if (this.fitContent()) classes.push('app-modal--fit-content');
    return classes.filter(Boolean).join(' ');
  });

  open(): void {
    if (this.modalRef) return;

    const template = this.modalTemplate();
    if (!template) return;
    this.modalRef = this.modalService.show(template, {
      class: this.modalDialogClasses(),
      backdrop: true,
      keyboard: this.keyboard(),
      ignoreBackdropClick: this.ignoreBackdropClick(),
    });
    this.suscribir_cierre_modal();
    this.opened.emit();
  }

  /** Compatibilidad con el API anterior. Si se pasa template, lo abre directamente. */
  openModal(template?: TemplateRef<unknown>): void {
    if (template) {
      this.modalRef = this.modalService.show(template, { class: this.modalDialogClasses(), backdrop: true });
      this.suscribir_cierre_modal();
      this.opened.emit();
      return;
    }
    this.open();
  }

  close(): void { this.modalRef?.hide(); }
  closeFirstModal(): void { this.close(); }
  closeModal(modalId?: number): void { modalId === undefined ? this.close() : this.modalService.hide(modalId); }

  private suscribir_cierre_modal(): void {
    this.modalRef?.onHidden
      ?.pipe(takeUntilDestroyed(this.destroy_ref))
      .subscribe(() => {
        this.modalRef = undefined;
        this.closed.emit();
      });
  }

  private readonly sizeClass = computed(() => {
    const classes: Record<ModalSize, string> = {
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl',
      xxl: 'modal-xxl',
      fullscreen: 'modal-fullscreen',

      'fullscreen-sm-down': 'modal-fullscreen-sm-down',
      'fullscreen-md-down': 'modal-fullscreen-md-down',
      'fullscreen-lg-down': 'modal-fullscreen-lg-down',
      'fullscreen-xl-down': 'modal-fullscreen-xl-down',
    };
    return classes[this.size()];
  });
}
