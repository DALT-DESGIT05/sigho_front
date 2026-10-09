import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';
import { LabelComponent } from '../label/label.component';

@Component({
  selector: 'app-file-drop',
  standalone: true,
  imports: [
    CommonModule,
    LabelComponent,
  ],
  templateUrl: './file-drop.component.html',
  styleUrl: './file-drop.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FileDropComponent),
    multi: true,
  }],
})
export class FileDropComponent implements ControlValueAccessor {
  readonly label = input('Archivo');
  readonly size = input<ComponentSize>('md');
  readonly color = input<PaletteColor>('primary');
  readonly accept = input('application/pdf');
  readonly max_size = input(1024 * 1024);
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly help_text = input('Arrastre el archivo aquí o selecciónelo desde su equipo.');
  readonly archivo_seleccionado = output<File | null>();
  readonly touch = output<void>();

  private readonly input_archivo = viewChild<ElementRef<HTMLInputElement>>('input_archivo');
  private on_change: (archivo: File | null) => void = () => undefined;
  private on_touched: () => void = () => undefined;

  readonly value = model<File | null>(null);
  readonly archivo = this.value;
  readonly arrastrando = signal(false);
  readonly deshabilitado_formulario = signal(false);
  readonly mensaje_error = signal('');
  readonly esta_deshabilitado = computed(() => this.disabled() || this.deshabilitado_formulario());
  readonly clases = computed(() => `file-drop--${this.size()} file-drop--${this.color()}`);

  writeValue(archivo: File | null): void {
    this.value.set(archivo);
    this.mensaje_error.set('');

    if (!archivo) {
      const input_archivo = this.input_archivo();
      if (input_archivo) {
        input_archivo.nativeElement.value = '';
      }
    }
  }

  registerOnChange(fn: (archivo: File | null) => void): void {
    this.on_change = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.on_touched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado_formulario.set(deshabilitado);
  }

  abrir_selector(): void {
    if (this.esta_deshabilitado()) {
      return;
    }

    this.input_archivo()?.nativeElement.click();
  }

  seleccionar_archivo(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.item(0) ?? null;
    this.asignar_archivo(archivo);
  }

  arrastrar_sobre(evento: DragEvent): void {
    evento.preventDefault();

    if (!this.esta_deshabilitado()) {
      this.arrastrando.set(true);
    }
  }

  salir_arrastre(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
  }

  soltar_archivo(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);

    if (this.esta_deshabilitado()) {
      return;
    }

    const archivo = evento.dataTransfer?.files.item(0) ?? null;
    this.asignar_archivo(archivo);
  }

  quitar_archivo(evento: MouseEvent): void {
    evento.stopPropagation();
    const input_archivo = this.input_archivo();
    if (input_archivo) {
      input_archivo.nativeElement.value = '';
    }
    this.mensaje_error.set('');
    this.actualizar_archivo(null);
  }

  private asignar_archivo(archivo: File | null): void {
    this.on_touched();
    this.touch.emit();

    if (!archivo) {
      return;
    }

    if (!this.es_archivo_permitido(archivo)) {
      this.mensaje_error.set('El tipo de archivo seleccionado no está permitido.');
      this.actualizar_archivo(null);
      return;
    }

    if (archivo.size > this.max_size()) {
      this.mensaje_error.set(`El archivo no debe superar ${this.tamano_maximo()}.`);
      this.actualizar_archivo(null);
      return;
    }

    this.mensaje_error.set('');
    this.actualizar_archivo(archivo);
  }

  private actualizar_archivo(archivo: File | null): void {
    this.archivo.set(archivo);
    this.on_change(archivo);
    this.archivo_seleccionado.emit(archivo);
  }

  private es_archivo_permitido(archivo: File): boolean {
    const aceptados = this.accept().split(',').map((valor) => valor.trim()).filter(Boolean);

    if (aceptados.length === 0) {
      return true;
    }

    return aceptados.some((aceptado) => aceptado === archivo.type || aceptado === `.${archivo.name.split('.').pop()?.toLowerCase()}`);
  }

  private tamano_maximo(): string {
    return `${Math.round(this.max_size() / (1024 * 1024))} MB`;
  }
}
