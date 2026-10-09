import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { Mock, vi } from 'vitest';

import { RecaptchaComponent } from './recaptcha.component';

describe('RecaptchaComponent', () => {
  let component: RecaptchaComponent;
  let fixture: ComponentFixture<RecaptchaComponent>;
  let execute: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecaptchaComponent],
      providers: [{
        provide: ReCaptchaV3Service,
        useValue: {
          execute: execute = vi.fn(
            (_siteKey: string, action: string, callback: (token: string) => void) => {
              if (action === 'login') callback('token-de-login');
            },
          ),
        },
      }],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('preloads the reCAPTCHA badge when initialized', () => {
    expect(execute).toHaveBeenCalledWith(expect.any(String), 'page_load', expect.any(Function), undefined, expect.any(Function));
  });

  it('emits a fresh token for the login action', () => {
    const emitted = vi.fn();
    component.tokenEmitter.subscribe(emitted);

    component.executeRecaptcha();

    expect(execute).toHaveBeenLastCalledWith(
      expect.any(String),
      'login',
      expect.any(Function),
      undefined,
      expect.any(Function),
    );
    expect(emitted).toHaveBeenCalledWith('token-de-login');
  });
});
