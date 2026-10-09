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
    component.login_model.set({ usuario: 'usuario', contrasena: 'contrasena', recuerdame: false });
    component.recaptchaToken = 'token';

    component.ingresar();

    expect(document.body.classList.contains('recaptcha-visible')).toBe(false);
  });

  it('starts with an invalid Signal Form and synchronizes field values to its model', () => {
    expect(component.login_form().valid()).toBe(false);

    component.login_form.usuario().value.set('usuario');
    component.login_form.contrasena().value.set('contrasena');

    expect(component.login_model()).toEqual({ usuario: 'usuario', contrasena: 'contrasena', recuerdame: false });
    expect(component.login_form().valid()).toBe(true);
  });

  it('does not submit an invalid Signal Form', () => {
    component.ingresar();

    expect(component.login_form.usuario().touched()).toBe(true);
    expect(component.login_form.contrasena().touched()).toBe(true);
    expect(component.recaptchaToken).toBeNull();
  });

  it('prevents the browser native submit before processing login', () => {
    const preventDefault = vi.fn();

    component.onLoginSubmit({ preventDefault } as unknown as Event);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(component.login_form.usuario().touched()).toBe(true);
  });
});
