import { AfterViewInit, Component, OnChanges, SimpleChanges, input, inject, output, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { UsuarioService } from '../../services/auth/usuario.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { MESSAGE_ERROR_DEFAULT, TITLE_MODAL } from '../../config/constants';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-update-telefono-paciente', standalone: true,
  imports: [FormField, ButtonComponent, ModalComponent],
  templateUrl: './update-telefono-paciente.component.html', styleUrl: './update-telefono-paciente.component.scss',
})
export class UpdateTelefonoPacienteComponent implements OnChanges, AfterViewInit {
  readonly input_telefono = input.required<string>();
  readonly input_dni = input.required<string>();
  readonly ouput_close = output<void>();
  readonly ouput_save = output<void>();
  readonly modal = viewChild<ModalComponent>('modal');
  private readonly usuario_service = inject(UsuarioService);
  private pendingOpen = false;

  readonly telefono_model = signal({ telefono: '' });
  readonly telefono_form = form(this.telefono_model, (schema) => {
    required(schema.telefono);
    disabled(schema.telefono, { when: () => this.isCompleted() || this.isSaving() });
  });
  readonly isSaving = signal(false);
  readonly isCompleted = signal(false);
  formulario = { modal: false, dni: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['input_telefono'] && !changes['input_dni']) return;
    const telefono = this.input_telefono();
    const dni = this.input_dni();
    if (!dni.trim()) { this.pendingOpen = false; return; }
    this.isSaving.set(false);
    this.isCompleted.set(false);
    this.telefono_model.set({ telefono });
    this.formulario.dni = dni;
    this.pendingOpen = true;
    this.openModalIfReady();
  }

  ngAfterViewInit(): void { this.openModalIfReady(); }
  close_modal = (): void => { this.modal()?.close(); this.ouput_close.emit(); };

  btn_save(): void {
    if (!this.telefono_form().valid()) {
      this.telefono_form.telefono().markAsTouched();
      return;
    }

    Swal.fire({ title: TITLE_MODAL, text: '¿Esta seguro de grabar?', icon: 'question', showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Si, estoy seguro', cancelButtonText: 'No' })
      .then((result) => { if (result.isConfirmed) this.action_save(); });
  }

  action_save(): void {
    this.isSaving.set(true);
    this.isCompleted.set(false);
    const telefono = this.telefono_model().telefono;
    this.usuario_service.change_telefono_paciente(this.formulario.dni, telefono).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isCompleted.set(true);
        Swal.fire({ title: TITLE_MODAL, text: 'El teléfono se ha cambiado correctamente.', icon: 'success', timer: 1500, showConfirmButton: true })
          .then(() => {
            this.modal()?.close();
            this.ouput_save.emit();
          });
      },
      error: (error) => {
        this.isSaving.set(false);
        this.isCompleted.set(false);
        if (error.status === 422) Swal.fire({ title: TITLE_MODAL, text: 'Ingrese telefono', icon: 'error' });
        else if (error.status === 500) Swal.fire({ title: TITLE_MODAL, text: error?.data?.message || MESSAGE_ERROR_DEFAULT, icon: 'error' });
        else if (error.status === 429) Swal.fire({ title: TITLE_MODAL, text: 'Cantidad de Intentos Superado. Espere 1 minuto', icon: 'error' });
      },
    });
  }

  private openModalIfReady(): void {
    if (!this.pendingOpen || !this.modal()) return;
    this.pendingOpen = false;
    this.modal()!.open();
  }
}
