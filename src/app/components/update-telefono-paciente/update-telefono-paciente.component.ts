import { AfterViewInit, Component, OnChanges, SimpleChanges, input, inject, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/auth/usuario.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { MESSAGE_ERROR_DEFAULT, TITLE_MODAL } from '../../config/constants';
import { ButtonComponent } from '../button/button.component';
import { InputTextComponent } from '../input-text/input-text.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-update-telefono-paciente', standalone: true,
  imports: [FormsModule, ButtonComponent, InputTextComponent, ModalComponent],
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

  formulario = { modal: false, done: false, search: false, telefono: '', dni: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['input_telefono'] && !changes['input_dni']) return;
    const telefono = this.input_telefono();
    const dni = this.input_dni();
    if (!dni.trim()) { this.pendingOpen = false; return; }
    this.formulario.telefono = telefono;
    this.formulario.dni = dni;
    this.pendingOpen = true;
    this.openModalIfReady();
  }

  ngAfterViewInit(): void { this.openModalIfReady(); }
  close_modal = (): void => { this.modal()?.close(); this.ouput_close.emit(); };

  btn_save(): void {
    Swal.fire({ title: TITLE_MODAL, text: '¿Esta seguro de grabar?', icon: 'question', showCancelButton: true, allowOutsideClick: false, allowEscapeKey: false, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Si, estoy seguro', cancelButtonText: 'No' })
      .then((result) => { if (result.isConfirmed) this.action_save(); });
  }

  action_save(): void {
    this.formulario.search = true;
    this.formulario.done = false;
    this.usuario_service.change_telefono_paciente(this.formulario.dni, this.formulario.telefono).subscribe({
      next: () => {
        this.formulario.search = false;
        this.formulario.done = true;
        Swal.fire({ title: TITLE_MODAL, text: 'El teléfono se ha cambiado correctamente.', icon: 'success', timer: 1500, showConfirmButton: true })
          .then(() => {
            this.modal()?.close();
            this.ouput_save.emit();
          });
        sessionStorage.setItem('contrasena_cambiada', '0');
        sessionStorage.setItem('telefono', this.formulario.telefono);
      },
      error: (error) => {
        this.formulario.search = false;
        this.formulario.done = false;
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
