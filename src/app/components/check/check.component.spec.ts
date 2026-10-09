import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { CheckComponent } from './check.component';

describe('CheckComponent', () => {
  let component: CheckComponent;
  let fixture: ComponentFixture<CheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckComponent] }).compileComponents();
    fixture = TestBed.createComponent(CheckComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('nombre', 'Acepto los t\u00e9rminos');
    fixture.detectChanges();
  });

  it('renders its label and synchronizes a change with the CVA and outputs', () => {
    const onChange = vi.fn();
    const checkedChange = vi.fn();
    component.registerOnChange(onChange);
    component.checkedChange.subscribe(checkedChange);

    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector('input');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    expect(fixture.nativeElement.querySelector('label').textContent.trim()).toBe('Acepto los t\u00e9rminos');
    expect(component.isChecked()).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('honors the disabled CVA state', () => {
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(component.isDisabled()).toBe(true);
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
