import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';

import { InputTextComponent } from './input-text.component';

@Component({
  imports: [FormField, InputTextComponent],
  template: '<app-input-text [formField]="profileForm.nombre" />',
})
class SignalFormsInputTextHostComponent {
  readonly profileModel = signal({ nombre: '' });
  readonly profileForm = form(this.profileModel);
}

describe('InputTextComponent', () => {
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputTextComponent] }).compileComponents();
    fixture = TestBed.createComponent(InputTextComponent);
  });

  it('creates the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('synchronizes with an Angular Signal Form through formField', async () => {
    const hostFixture = TestBed.createComponent(SignalFormsInputTextHostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const input = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'María Pérez';
    input.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.profileModel().nombre).toBe('María Pérez');

    hostFixture.componentInstance.profileModel.set({ nombre: 'Ana Torres' });
    hostFixture.detectChanges();

    expect(input.value).toBe('Ana Torres');
  });
});
