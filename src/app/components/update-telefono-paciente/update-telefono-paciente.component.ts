import { Component, inject, output, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, pattern, required } from '@angular/forms/signals';
import { PacienteService } from '../../services/emergencia/paciente.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { MESSAGE_ERROR_DEFAULT, TITLE_MODAL } from '../../config/constants';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-update-telefono-paciente', standalone: true,
  imports: [FormField, ButtonComponent, ModalComponent],
  templateUrl: './update-telefono-paciente.component.html', styleUrl: './update-telefono-paciente.component.scss',
})
export class UpdateTelefonoPacienteComponent {
  readonly ouput_close = output<void>();
  readonly ouput_save = output<string>();
  readonly modal = viewChild<ModalComponent>('modal');
  private readonly paciente_service = inject(PacienteService);

  readonly telefono_model = signal({ telefono: '' });
  readonly telefono_form = form(this.telefono_model, (schema) => {
    required(schema.telefono);
    pattern(schema.telefono, /^[0-9]{7,15}$/);
    disabled(schema.telefono, { when: () => this.isCompleted() || this.isSaving() });
  });
  readonly isSaving = signal(false);
  readonly isCompleted = signal(false);
  formulario = { persona_id: 0, correo_actual: null as string | null };

  /** Abre el modal con los datos de contacto actuales del paciente. */
  abrir(telefono_actual: string, persona_id: number, correo_actual: string | null): void {
    this.isSaving.set(false);
    this.isCompleted.set(false);
    this.telefono_model.set({ telefono: telefono_actual });
    this.formulario = { persona_id, correo_actual };
    this.modal()?.open();
  }

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
    this.paciente_service.actualizarContacto({
      persona_id: this.formulario.persona_id,
      celular: telefono,
      correo_electronico: this.formulario.correo_actual,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isCompleted.set(true);
        Swal.fire({ title: TITLE_MODAL, text: 'El teléfono se ha cambiado correctamente.', icon: 'success', timer: 1200, timerProgressBar: true, showConfirmButton: false })
          .then(() => {
            this.modal()?.close();
            this.ouput_save.emit(telefono);
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
}
