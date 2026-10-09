import { AfterViewInit, Component, OnChanges, SimpleChanges, input, inject, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/auth/usuario.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { MESSAGE_ERROR_DEFAULT, TITLE_MODAL } from '../../config/constants';
import { ButtonComponent } from '../button/button.component';
import { InputTextComponent } from '../input-text/input-text.component';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-update-correo-paciente', standalone: true,
  imports: [FormsModule, ButtonComponent, InputTextComponent, ModalComponent],
  templateUrl: './update-correo-paciente.component.html', styleUrl: './update-correo-paciente.component.scss',
})
export class UpdateCorreoPacienteComponent implements OnChanges, AfterViewInit {
  readonly input_correo = input.required<string>();
  readonly input_dni = input.required<string>();
  readonly ouput_close = output<void>();
  readonly ouput_save = output<void>();
  readonly modal = viewChild<ModalComponent>('modal');
  private readonly usuario_service = inject(UsuarioService);
  private pendingOpen = false;

  formulario = { modal: false, done: false, search: false, correo: '', dni: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['input_correo'] && !changes['input_dni']) return;
    const correo = this.input_correo();
    const dni = this.input_dni();
    if (!dni.trim()) { this.pendingOpen = false; return; }
    this.formulario.correo = correo;
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
    this.usuario_service.change_correo_paciente(this.formulario.dni, this.formulario.correo).subscribe({
      next: () => {
        this.formulario.search = false;
        this.formulario.done = true;
        sessionStorage.setItem('email', this.formulario.correo);
        Swal.fire({ title: TITLE_MODAL, text: 'El Correo se ha cambiado correctamente.', icon: 'success', timer: 1500, showConfirmButton: true })
          .then(() => {
            this.modal()?.close();
            this.ouput_save.emit();
          });
      },
      error: (error) => {
        this.formulario.search = false;
        this.formulario.done = false;
        if (error.status === 422) Swal.fire({ title: TITLE_MODAL, text: 'Ingrese correo', icon: 'error' });
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
