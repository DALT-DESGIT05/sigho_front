import { Component, OnInit, inject, output } from '@angular/core';
import { ReCaptchaV3Service } from 'ngx-captcha';

const RECAPTCHA_SITE_KEY = '6LfGiQsqAAAAAJ2jmEwuonopsQDq2EAaq0b82gud';

@Component({
  selector: 'app-recaptcha',
  standalone: true,
  imports: [],
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.css'
})
export class RecaptchaComponent implements OnInit {
  readonly tokenEmitter = output<string>();
  readonly errorEmitter = output<void>();
  private readonly recaptchaService = inject(ReCaptchaV3Service);
  private recaptcha_timeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // Load the Google reCAPTCHA v3 script as soon as the login is displayed so
    // its badge is visible before the user submits the form. This token is not
    // used; executeRecaptcha generates a fresh token for every action.
    this.recaptchaService.execute(RECAPTCHA_SITE_KEY, 'page_load', () => undefined, undefined, () => undefined);
  }

  executeRecaptcha(): void {
    this.cancelar_timeout();
    this.recaptcha_timeout = setTimeout(() => this.notificar_error(), 15000);

    this.recaptchaService.execute(RECAPTCHA_SITE_KEY, 'login', (token) => {
      this.cancelar_timeout();
      this.tokenEmitter.emit(token);
    }, undefined, () => this.notificar_error());
  }

  private notificar_error(): void {
    this.cancelar_timeout();
    this.errorEmitter.emit();
  }

  private cancelar_timeout(): void {
    if (this.recaptcha_timeout) {
      clearTimeout(this.recaptcha_timeout);
      this.recaptcha_timeout = undefined;
    }
  }
}
