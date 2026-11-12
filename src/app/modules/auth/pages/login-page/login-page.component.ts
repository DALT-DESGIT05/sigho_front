import { ImagenPipe } from '../../../../pipes/imagen.pipe';
import { Component, inject, ViewChild, CUSTOM_ELEMENTS_SCHEMA, signal, computed, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormField, email, form, minLength, required } from '@angular/forms/signals';
import { LoginService } from '../../../../services/auth/login.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { UtilService } from '../../../../services/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RecaptchaComponent } from '../../../../components/recaptcha/recaptcha.component';
import { MailService } from '../../../../services/auth/mail.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { QRCodeComponent } from 'angularx-qrcode';
import { MenuService } from '../../../../services/menu.service';
import { Modal } from 'bootstrap';
import { ButtonComponent } from '../../../../components/button/button.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ImagenPipe,
    FormField, RecaptchaComponent, QRCodeComponent, ButtonComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoginPageComponent implements OnInit, OnDestroy {

  @ViewChild(RecaptchaComponent) recaptchaComponent!: RecaptchaComponent;
  data_lista_dominios = signal<Array<any>>([]);
  modalRef?: BsModalRef;
  formModal!: Modal;
  formModal2Fa!: Modal;
  mostrarQr: boolean = false;

  @ViewChildren('otp') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otpDigits: string[] = ['', '', '', '', '', ''];
  isLoadingOtp = false;
  qrcode_url: string | null = null;


  currentStep: number = 1;
  recaptchaToken: string | null = null;
  currentAction: 'login' | 'reset' | null = null;
  isPasswordVisible: boolean = false;
  private readonly login_service = inject(LoginService);
  private readonly utilService = inject(UtilService);
  private readonly menuService = inject(MenuService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  error_usuario: string | null = null;
  error_contrasena: string | null = null;
  error_usuario_rest: string | null = null;
  error_email_rest: string | null = null;
  reset_psw: boolean = false;
  estado: boolean = false;
  private captchaExecutionPending = false;
  private loginRequestInFlight = false;
  private resetRequestInFlight = false;

  readonly login_model = signal({ usuario: '', contrasena: '', recuerdame: false });
  readonly login_form = form(this.login_model, (schema) => {
    required(schema.usuario); minLength(schema.usuario, 5);
    required(schema.contrasena); minLength(schema.contrasena, 8);
  });
  readonly reset_model = signal({ usuario_rest: '', email_rest: '', dominio_rest: '', codigo_rest: '', psw_rest: '', psw2_rest: '' });
  readonly reset_form = form(this.reset_model, (schema) => {
    required(schema.usuario_rest);
    required(schema.email_rest);
    email(schema.email_rest);
    required(schema.codigo_rest);
    required(schema.psw_rest);
    minLength(schema.psw_rest, 8);
    required(schema.psw2_rest);
    minLength(schema.psw2_rest, 8);
  });

  constructor(private mail_service: MailService) { }

  isLoading: boolean = false;

  readonly canSendPasswordReset = computed(() => this.reset_form.usuario_rest().valid() && this.reset_form.email_rest().valid() && !this.estado && !this.resetRequestInFlight);


  ngOnInit(): void {

    document.body.classList.add('recaptcha-visible');

    this.route.queryParams.subscribe(({ reason }) => {
      if (reason === 'session_expired') {
        Swal.fire({
          title: 'Sesión caducada',
          text: 'Tu sesión expiró. Inicia sesión nuevamente para continuar.',
          icon: 'info'
        });
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { reason: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });

    const passwordModal = document.getElementById('modal_code');
    const twoFactorModal = document.getElementById('modal_code_2auth');

    if (passwordModal) this.formModal = new Modal(passwordModal);
    if (twoFactorModal) this.formModal2Fa = new Modal(twoFactorModal);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('recaptcha-visible');
  }

  handleToken(token: string) {
    this.captchaExecutionPending = false;
    this.recaptchaToken = token;
    if (this.currentAction === 'login') {
      this.ingresar();
    } else if (this.currentAction === 'reset') {
      this.enviar_restablecimiento();
    }
  }

  handle_recaptcha_error(): void {
    this.captchaExecutionPending = false;
    this.recaptchaToken = null;
    this.estado = false;
    this.isLoading = false;

    Swal.fire({
      title: 'Login',
      text: 'No se pudo conectar con el servicio de Google reCAPTCHA. Verifique su conexión a internet.',
      icon: 'error'
    });
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();
    this.ingresar();
  }

  onResetSubmit(event: Event): void {
    event.preventDefault();
    this.enviar_restablecimiento();
  }

  ingresar(): void {
    if (this.loginRequestInFlight || this.captchaExecutionPending) {
      return;
    }

    if (!this.login_form().valid()) {
      this.login_form.usuario().markAsTouched();
      this.login_form.contrasena().markAsTouched();
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      Swal.fire({
        title: 'Login',
        text: 'No hay conexión a internet. Verifique su red e inténtelo nuevamente.',
        icon: 'error'
      });
      return;
    }

    this.estado = true;
    this.currentAction = 'login';
    this.error_usuario = null;
    this.error_contrasena = null;

    const usuario = this.login_model().usuario;
    const contrasena = this.login_model().contrasena;
    const recuerdame = this.login_model().recuerdame;

    if (!this.recaptchaToken) {
      this.captchaExecutionPending = true;
      this.recaptchaComponent.executeRecaptcha();
      return;
    }

    const recaptchaToken = this.recaptchaToken;
    this.recaptchaToken = null;
    this.loginRequestInFlight = true;

    this.login_service.login(usuario, contrasena, recuerdame, recaptchaToken)
      .subscribe({
        next: (success) => {
          this.loginRequestInFlight = false;
          this.estado = false;
          document.body.classList.remove('recaptcha-visible');
          // if (success) {
          //   this.two_fa_enable();
          // }
          Swal.fire({
            title: "Login",
            text: "Usuario logueado correctamente",
            icon: "success",
            timer: 1500
          });
          this.redirectAfterLogin();
        },
        error: (error) => {
          this.loginRequestInFlight = false;
          this.recaptchaToken = null;
          if (error.status === 422) {
            this.estado = false;
            const errores = error.data.errors;
            if (errores.hasOwnProperty('usuario')) { this.error_usuario = this.utilService.error_utils(errores.usuario); }
            if (errores.hasOwnProperty('contrasena')) { this.error_contrasena = this.utilService.error_utils(errores.contrasena); }
        } else {
          this.estado = false;
          Swal.fire({
            title: "Login",
            text: error.status === 0
              ? 'No hay conexión con el backend. Verifique su conexión a internet.'
              : error.data?.message || 'No se pudo iniciar sesión.',
            icon: "error"
          });
          }
        }
      });
  }

  private redirectAfterLogin(): void {
    this.menuService.loadMenu().subscribe({
      next: (menu) => {
        this.router.navigateByUrl(this.menuService.getFirstMenuLink(menu) ?? '/');
      },
      error: () => {
        this.router.navigateByUrl('/');
      }
    });
  }

  open_reset() {
    this.reset_psw = !this.reset_psw;
    this.error_usuario_rest = null;
    this.error_email_rest = null;
  }

  clearResetValidationError(field: 'usuario' | 'email'): void {
    if (field === 'usuario') {
      this.error_usuario_rest = null;
      return;
    }

    this.error_email_rest = null;
  }

  clearLoginValidationError(field: 'usuario' | 'contrasena'): void {
    if (field === 'usuario') {
      this.error_usuario = null;
      return;
    }

    this.error_contrasena = null;
  }

  listar_dominios() {
    this.mail_service.list_dominios()
      .subscribe({
        next: (data) => {
          this.data_lista_dominios.set(data);
        },
        error: (error) => {
          this.data_lista_dominios.set([]);
          Swal.fire({
            title: "Lista de Dominios",
            text: error.data.message,
            icon: "error"
          });
        }
      });
  }

  enviar_restablecimiento() {
    if (this.resetRequestInFlight || this.captchaExecutionPending) {
      return;
    }

    if (!this.reset_form.usuario_rest().valid() || !this.reset_form.email_rest().valid()) {
      this.reset_form.usuario_rest().markAsTouched();
      this.reset_form.email_rest().markAsTouched();
      return;
    }

    this.error_usuario_rest = null;
    this.error_email_rest = null;

    this.currentAction = 'reset';
    this.estado = true;
    if (!this.recaptchaToken) {
      this.captchaExecutionPending = true;
      this.recaptchaComponent.executeRecaptcha();
      return;
    }

    const data = this.reset_model();
    const usuario = data.usuario_rest || '';
    const correo = data.email_rest || '';
    const dominio = Number(data.dominio_rest) || 0;
    const ip_usuario = '127.0.0.1';

    this.isLoading = true;
    const recaptchaToken = this.recaptchaToken;
    this.recaptchaToken = null;
    this.resetRequestInFlight = true;

    this.mail_service.validar_correo(usuario, correo, dominio, ip_usuario, recaptchaToken)
      .subscribe({
        next: (response) => {
          this.resetRequestInFlight = false;
          this.estado = false;
          Swal.fire({
            title: "Restablecimiento",
            text: "Se envió el código a su correo",
            icon: "success"
          });
          this.recaptchaToken = null;  // Restablecer el token después del éxito
          this.open_modal();
          this.isLoading = false;
        },
        error: (error) => {
          this.resetRequestInFlight = false;
          this.estado = false;
          this.recaptchaToken = null;  // Restablecer el token en caso de error
          this.isLoading = false;
          const title = "Restablecimiento";
          const message = error.data?.message || "Error desconocido";

          if (error.status === 422) {
            const errores = error.data?.errors || {};
            this.error_usuario_rest = this.utilService.error_utils(
              errores.usuario_rest || errores.usuario || []
            );
            this.error_email_rest = this.utilService.error_utils(
              errores.email_rest || errores.email || errores.correo || []
            );

            if (this.error_usuario_rest || this.error_email_rest) {
              return;
            }
          }

          if (error.status === 500 || error.status === 422 || error.status === 429) {
            Swal.fire({ title, text: message, icon: "error" });
          }
        }
      });
  }

  open_modal() {
    this.formModal?.show();
  }

  close_modal() {
    this.formModal?.hide();
  }

  open_modal_2fa() {
    this.formModal2Fa?.show();
  }

  close_modal_2fa() {
    this.formModal2Fa?.hide();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  restablecer_by_correo() {
    const passwordFields = [
      this.reset_form.codigo_rest(),
      this.reset_form.psw_rest(),
      this.reset_form.psw2_rest(),
    ];
    if (passwordFields.some((field) => !field.valid())) {
      passwordFields.forEach((field) => field.markAsTouched());
      return;
    }

    const data = this.reset_model();
    this.estado = true;
    const nuevaclave = data.psw_rest || '';
    const repetirclave = data.psw2_rest || '';
    const codigoverificacion = data.codigo_rest || '';
    const usuario = data.usuario_rest || '';
    const correo = data.email_rest || '';
    const dominio = Number(data.dominio_rest) || 0;
    const ip_usuario = '127.0.0.1';

    this.mail_service.restablecer_by_correo(nuevaclave, repetirclave, codigoverificacion, usuario, correo, dominio, ip_usuario).subscribe({
      next: (response) => {
        this.estado = false;
        Swal.fire({
          title: "Restablecimiento",
          text: "Su clave se cambió con éxito",
          icon: "success"
        });
        this.close_modal();
        this.reset_psw = false;
      },
      error: (error) => {
        this.estado = false;
        if (error.status === 422 && error.data.errors) {
          // Recoger todos los errores en un solo mensaje
          let errorMessage = '<ul>';
          Object.keys(error.data.errors).forEach(field => {
            error.data.errors[field].forEach((errMsg: string) => {
              errorMessage += `<li>${errMsg}</li>`;
            });
          });
          errorMessage += '</ul>';

          // Mostrar los errores en un Swal
          Swal.fire({
            title: "Error al restablecer la clave",
            html: errorMessage,
            icon: "error"
          });
        } else {
          // Manejar otros tipos de errores
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error inesperado",
            icon: "error"
          });
        }
      }
    });
  }

  two_fa_enable() {
    this.login_service.two_fa_enable()
      .subscribe({
        next: (resp: any) => {
          this.qrcode_url = resp.data.qrcode_url;
          this.mostrarQr = resp.data.activo;

          this.open_modal_2fa();
        },
        error: (error) => {
        }
      });
  }


  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = (input.value || '').replace(/\D/g, ''); // solo dígitos

    if (!value) {
      input.value = '';
      this.otpDigits[index] = '';
      return;
    }

    // si el user pegó varios caracteres o pegó por error, distribuimos
    if (value.length > 1) {
      this.fillFrom(index, value);
      return;
    }

    // valor válido: un dígito
    input.value = value;
    this.otpDigits[index] = value;

    // avanzar al siguiente SOLO porque el usuario digitó un dígito
    if (index < this.otpDigits.length - 1) {
      const arr = this.otpInputs.toArray();
      const next = arr[index + 1];
      next?.nativeElement.focus();
      next?.nativeElement.select();
    }

    // si ya completó los 6 → validar
    if (this.otpDigits.every(d => d !== '')) {
      const code = this.otpDigits.join('');
      this.validateOtp(code);
    }
  }

  // ===== keydown handler (backspace / flechas) =====
  onOtpKeydown(event: KeyboardEvent, index: number) {
    const key = event.key;
    const input = event.target as HTMLInputElement;

    if (key === 'Backspace') {
      // si hay valor en la casilla, borrarlo y quedarse
      if (input.value) {
        input.value = '';
        this.otpDigits[index] = '';
        event.preventDefault();
        return;
      }

      // si está vacía, ir a la anterior
      if (index > 0) {
        const prev = this.otpInputs.toArray()[index - 1];
        prev.nativeElement.focus();
        prev.nativeElement.select();
        this.otpDigits[index - 1] = ''; // opcional limpiar anterior
      }
    } else if (key === 'ArrowLeft') {
      if (index > 0) this.otpInputs.toArray()[index - 1].nativeElement.focus();
      event.preventDefault();
    } else if (key === 'ArrowRight') {
      if (index < this.otpDigits.length - 1) this.otpInputs.toArray()[index + 1].nativeElement.focus();
      event.preventDefault();
    } else {
      // permitir solo dígitos (prevent otras teclas, ignorar combinaciones como Ctrl+V)
      const isModifier = event.ctrlKey || event.metaKey || event.altKey;
      if (!/^[0-9]$/.test(key) && !isModifier && key.length === 1) {
        event.preventDefault();
      }
    }
  }

  // ===== paste handler (pegar cadena y distribuir) =====
  onOtpPaste(ev: ClipboardEvent, startIndex: number) {
    ev.preventDefault();
    const clipboard = ev.clipboardData?.getData('text') || '';
    const digits = clipboard.replace(/\D/g, '');
    if (!digits) return;
    this.fillFrom(startIndex, digits);
  }

  // ===== helper para distribuir dígitos a partir del índice =====
  fillFrom(startIndex: number, digits: string) {
    const arr = this.otpInputs.toArray();
    const chars = digits.split('');
    for (let i = 0; i < chars.length && startIndex + i < this.otpDigits.length; i++) {
      const d = chars[i].replace(/\D/g, '').charAt(0) || '';
      this.otpDigits[startIndex + i] = d;
      const el = arr[startIndex + i];
      if (el) el.nativeElement.value = d;
    }

    // focus al primer input vacío después del bloque rellenado (o al último si está completo)
    const nextEmpty = this.otpDigits.findIndex((v, idx) => v === '' && idx >= startIndex);
    const focusIndex = nextEmpty === -1 ? this.otpDigits.length - 1 : nextEmpty;
    arr[focusIndex]?.nativeElement.focus();
    arr[focusIndex]?.nativeElement.select();

    if (this.otpDigits.every(d => d !== '')) {
      this.validateOtp(this.otpDigits.join(''));
    }
  }

  validateOtp(otpCode: string) {

    this.login_service.validate_2fa(otpCode).subscribe({
      next: (resp) => {
        Swal.fire({
          title: 'Autenticación',
          text: 'Código verificado con éxito',
          icon: 'success'
        });
        this.clearOtp();
        this.close_modal_2fa();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'El código ingresado no es válido',
          icon: 'error'
        });
        this.clearOtp();
        // focus al primer input
        setTimeout(() => this.otpInputs.first?.nativeElement.focus(), 0);
      }
    });
  }

  clearOtp() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpInputs.forEach(el => el.nativeElement.value = '');
  }

}
