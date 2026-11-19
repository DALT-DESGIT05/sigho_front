import { Component, inject, output, signal, viewChild } from '@angular/core';
import { disabled, form, FormField, pattern, required } from '@angular/forms/signals';
import { PacienteService } from '../../services/pacientes/paciente.service';
import { UtilService } from '../../services/util.service';
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
  private readonly util_service = inject(UtilService);

  readonly telefono_model = signal({ telefono: '' });
  readonly telefono_form = form(this.telefono_model, (schema) => {
    required(schema.telefono);
    pattern(schema.telefono, /^[0-9]{7,15}$/);
    disabled(schema.telefono, { when: () => this.isCompleted() || this.isSaving() });
  });
  readonly isSaving = signal(false);
  readonly isCompleted = signal(false);
  formulario = { persona_id: 0, correo_actual: null as string | null };

  abrir(telefono_actual: string, persona_id: number, correo_actual: string | null): void {
    this.isSaving.set(false);
    this.isCompleted.set(false);
    this.telefono_model.set({ telefono: telefono_actual });
    this.formulario = { persona_id, correo_actual };
    this.modal()?.open();
  }

  close_modal = (): void => { this.modal()?.close(); this.ouput_close.emit(); };

  async btn_save(): Promise<void> {
    if (!this.telefono_form().valid()) {
      this.telefono_form.telefono().markAsTouched();
      return;
    }

    const confirmado = await this.util_service.confirmar_accion({
      title: TITLE_MODAL,
      text: '¿Está seguro de grabar?',
      icon: 'question',
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'No',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (confirmado) {
      this.action_save();
    }
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
        this.util_service.mostrar_alerta('El teléfono se ha cambiado correctamente.', 'success', 1200);
        this.modal()?.close();
        this.ouput_save.emit(telefono);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.isCompleted.set(false);
        if (error.status === 422) {
          this.util_service.mostrar_error('Ingrese teléfono');
        } else if (error.status === 500) {
          this.util_service.mostrar_error(error?.data?.message || MESSAGE_ERROR_DEFAULT);
        } else if (error.status === 429) {
          this.util_service.mostrar_error('Cantidad de Intentos Superado. Espere 1 minuto');
        } else {
          this.util_service.mostrar_error();
        }
      },
    });
  }
}
