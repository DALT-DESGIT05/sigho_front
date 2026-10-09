import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ReCaptchaV3Service } from 'ngx-captcha';

import { AuthService } from '../../../../services/auth/auth.service';
import { MailService } from '../../../../services/auth/mail.service';
import { MenuService } from '../../../../services/menu.service';
import { UtilService } from '../../../../services/util.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({ matches: false, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }),
    });
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login: () => of(true), logout: () => of(true), two_fa_enable: () => of({}), validate_2fa: () => of({}) } },
        { provide: MailService, useValue: { list_dominios: () => of([]), validar_correo: () => of(true), restablecer_by_correo: () => of(true) } },
        { provide: MenuService, useValue: { loadMenu: () => of([]), getFirstMenuLink: () => '/' } },
        { provide: UtilService, useValue: { error_utils: () => '' } },
        { provide: ReCaptchaV3Service, useValue: { execute: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('hides the reCAPTCHA badge after a successful login', () => {
    document.body.classList.add('recaptcha-visible');
    component.loginForm.setValue({ usuario: 'usuario', contrasena: 'contrasena', recuerdame: false });
    component.recaptchaToken = 'token';

    component.ingresar();

    expect(document.body.classList.contains('recaptcha-visible')).toBe(false);
  });
});
