import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { PaletteColor } from '../interfaces/util.interface';
import { Paginado } from '../interfaces/response.interface';
import { CatalogoParametroClinico } from '../interfaces/emergencia/catalogo-emergencia.interface';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { MESSAGE_ERROR_DEFAULT, TITLE_MODAL } from '../config/constants';

export interface PaginadoLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PaginadoMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string | null;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  abrir_ventana_pdf_cargando(titulo = 'Generando documento'): Window | null {
    const ventana_pdf = window.open('', '_blank');

    if (!ventana_pdf) {
      return null;
    }

    ventana_pdf.document.title = titulo;
    ventana_pdf.document.body.style.cssText = 'font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;color:#11356e;';

    const contenido = ventana_pdf.document.createElement('main');
    contenido.style.textAlign = 'center';

    const icono = ventana_pdf.document.createElement('i');
    icono.className = 'fa-solid fa-file-pdf';
    icono.style.fontSize = '42px';

    const mensaje = ventana_pdf.document.createElement('p');
    mensaje.style.margin = '16px 0 0';
    mensaje.textContent = `${titulo}, espere un momento…`;

    contenido.append(icono, mensaje);
    ventana_pdf.document.body.replaceChildren(contenido);

    return ventana_pdf;
  }

  mostrar_pdf_en_ventana(ventana_pdf: Window | null, pdf: Blob): void {
    const url_pdf = URL.createObjectURL(pdf);

    if (ventana_pdf) {
      ventana_pdf.location.href = url_pdf;
    } else {
      window.open(url_pdf, '_blank');
    }

    window.setTimeout(() => URL.revokeObjectURL(url_pdf), 60_000);
  }

  cerrar_ventana_pdf(ventana_pdf: Window | null): void {
    ventana_pdf?.close();
  }

  mostrar_alerta(mensaje: string, icono: 'success' | 'info' | 'warning' | 'error' = 'success', tiempo?: number): void {
    Swal.fire({
      title: TITLE_MODAL,
      text: mensaje,
      icon: icono,
      timer: tiempo,
      timerProgressBar: tiempo !== undefined,
    });
  }

  mostrar_error(mensaje?: string, tiempo?: number): void {
    this.mostrar_alerta(mensaje ?? MESSAGE_ERROR_DEFAULT, 'error', tiempo);
  }

  empty_page<T>(perPage: number): Paginado<T> {
    return {
      current_page: 1,
      data: [],
      first_page_url: '',
      from: 0,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: '',
      path: null,
      per_page: perPage,
      prev_page_url: null,
      to: 0,
      total: 0,
    };
  }

  numero_fila(currentPage: number, perPage: number, index: number): number {
    return ((currentPage - 1) * perPage) + index + 1;
  }
  error_utils(errors: readonly string[] | null | undefined): string | null {
    return errors?.[0]?.trim() || null;
  }

  to_upper(value: unknown): string {
    return this.clear_null(value).toUpperCase();
  }

  to_lower(value: unknown): string {
    return this.clear_null(value).toLowerCase();
  }

  to_capitalized(value: unknown): string {
    const text = this.to_lower(value);
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  clear_null(value: unknown): string {
    return value == null ? '' : String(value).trim();
  }

  clear_number(value: unknown): number {
    if (value == null || value === '') {
      return 0;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  /** Conserva solo dígitos; útil para limpiar valores escritos o pegados. */
  only_number_value(value: unknown): string {
    return this.clear_null(value).replace(/\D/g, '');
  }

  /** Bloquea el pegado de contenido en un campo. */
  prevent_paste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  /** Asigna errores de validación 422 del API a los controles indicados. */
  applyApiValidationErrors(form: FormGroup, error: unknown, fields: string[]): boolean {
    const response = error as {
      code?: number;
      statusCode?: number;
      errors?: unknown;
      data?: { errors?: unknown };
    };
    if (!this.isApiValidationError(response)) return false;

    const errors = response.errors ?? response.data?.errors;
    if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return false;

    let assigned = false;
    fields.forEach(field => {
      const message = this.firstApiError((errors as Record<string, unknown>)[field]);
      const control = form.get(field);
      if (!message || !control) return;

      control.setErrors({ ...(control.errors ?? {}), backend: message });
      control.markAsTouched();
      assigned = true;
    });
    return assigned;
  }

  isApiValidationError(error: unknown): boolean {
    const response = error as { code?: number; statusCode?: number };
    return response?.code === 422 || response?.statusCode === 422;
  }

  /** Limpia solo los errores devueltos por API, conservando validadores locales. */
  clearApiValidationErrors(form: FormGroup, fields: string[]): void {
    fields.forEach(field => {
      const control = form.get(field);
      if (!control) return;

      const { backend, ...remainingErrors } = control.errors ?? {};
      if (backend !== undefined) control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });

  }

  apiValidationMessage(control: AbstractControl | null, fallback: string): string {
    return typeof control?.errors?.['backend'] === 'string'
      ? control.errors['backend']
      : fallback;
  }

  /** Obtiene exclusivamente un mensaje emitido por un validador o por el API. */
  validationMessage(control: AbstractControl | null): string | null {
    if (!control?.errors) return null;

    const errors = control.errors;
    if (typeof errors['backend'] === 'string') return errors['backend'];
    if (errors['required']) return 'Este campo es obligatorio.';
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}.`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}.`;

    for (const value of Object.values(errors)) {
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
        return value.message;
      }
    }

    return null;
  }


  field_error(form: AbstractControl,field: string | readonly (string | number)[]): string | null {
    const control = form.get(field);
    if (!control?.invalid || !control.touched) return null;

    return this.validationMessage(control)?? 'Error inesperado. Comuníquese con soporte.';
  }

  private firstApiError(value: unknown): string | null {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
    return typeof value === 'string' ? value : null;
  }

  /** Formatea un número con la cantidad indicada de decimales usando la convención peruana. */
  format_number(value: unknown, decimals = 2): string {
    const fractionDigits = Math.max(0, decimals);
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(this.clear_number(value));
  }

  /** Formatea importe en soles peruanos (PEN). */
  format_currency_pen(value: unknown, decimals = 2): string {
    const fractionDigits = Math.max(0, decimals);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(this.clear_number(value));
  }

  /** Formatea un importe en la moneda indicada; PEN usa el formato local de soles. */
  format_currency(value: unknown, currency = 'PEN', decimals = 2): string {
    if (currency === 'PEN') return this.format_currency_pen(value, decimals);
    const fractionDigits = Math.max(0, decimals);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(this.clear_number(value));
  }

  pago_badge_class(pago: string): string {
    switch (this.to_upper(pago)) {
      case 'PENDIENTE':
        return 'danger';
      case 'PAGADO':
        return 'success';
      case 'COBERTURADO':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  situacion_badge_class(situacion: string): string {
    switch (this.to_upper(situacion)) {
      case 'ELIMINADA':
        return 'danger';
      case 'ATENDIDA':
        return 'success';
      case 'RESERVADA':
        return 'warning';
      case 'ANULADA':
        return 'primary';
      case 'FALTO':
        return 'danger';
      case 'CITA EN PROCESO':
        return 'info';
      case 'NO ATENDIDO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  situacion_examen_badge_class(situacion: string): string {
    const valor=this.to_upper(situacion);

    if(['PROCESADO', 'PROCESADA', 'COMPLETADO', 'FINALIZADO', 'VALIDADO', 'ATENDIDO','INFORMADO'].includes(valor)){
      return 'success';
    }else if(['PENDIENTE', 'EN PROCESO', 'PROCESANDO','PROGRAMADO'].includes(valor)){
      return 'warning';
    }else if(['ANULADO', 'CANCELADO', 'RECHAZADO'].includes(valor)){
      return 'danger';
    }
    return 'secondary';
  }

  format_dias(dias:number):string{
    return `${dias} ${dias === 1 ? 'día' : 'días'}`;
  }

  prevent_negative(event: KeyboardEvent): void {
    if (event.key === '-') {
      event.preventDefault();
    }
  }

  prevent_decimal(event: KeyboardEvent): void {
    if (event.key === '.') {
      event.preventDefault();
    }
  }

  only_number(event: KeyboardEvent):void{
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key)) {
      return;
    }

    if (event.key < '0' || event.key > '9') {
      event.preventDefault();
    }
  }

  only_number_decimal(event: KeyboardEvent,cant_decimal:number=2): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (event.ctrlKey || event.metaKey || allowedKeys.includes(event.key)) {
      return;
    }

    const input = event.target as HTMLInputElement;

    // Permitir un solo punto decimal
    if (event.key === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    // Solo permitir dígitos
    if (event.key < '0' || event.key > '9') {
      event.preventDefault();
    }

    // Limitar decimales
    const punto = input.value.indexOf('.');

    if (punto !== -1) {
      const decimales = input.value.substring(punto + 1);

      // Si el cursor está al final y ya hay 2 decimales
      if ( input.selectionStart === input.value.length && decimales.length >= cant_decimal ) {
        event.preventDefault();
      }
    }
  }

  max_number(event: KeyboardEvent,numero:number):void{
    const input = event.target as HTMLInputElement;

    const nuevoValor = input.value.substring(0, input.selectionStart ?? 0) + event.key + input.value.substring(input.selectionEnd ?? 0);

    if (Number(nuevoValor) > numero) {
      event.preventDefault();
    }
  }

  temperature_status(valor: any, edad?: number): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(2));

    if (numero === 0) return 'secondary';

    if (edad !== undefined && edad < 1 && numero >= 38.0) {
      return 'danger';
    }

    if (numero < 35.0 || numero > 39.0) return 'danger';
    if (numero >= 36.0 && numero <= 37.9) return 'success';

    return 'warning';
  }

  heart_rate_status(valor: any, edad?: number): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));

    if (numero === 0) return 'secondary';

    if (edad !== undefined) {
      if (edad < 1) {
        if (numero < 90 || numero > 180) return 'danger';
        if (numero >= 110 && numero <= 160) return 'success';
        return 'warning';
      }
      if (edad >= 1 && edad <= 2) {
        if (numero < 85 || numero > 165) return 'danger';
        if (numero >= 100 && numero <= 150) return 'success';
        return 'warning';
      }
      if (edad >= 3 && edad <= 5) {
        if (numero < 80 || numero > 155) return 'danger';
        if (numero >= 95 && numero <= 140) return 'success';
        return 'warning';
      }
      if (edad >= 6 && edad <= 12) {
        if (numero < 70 || numero > 135) return 'danger';
        if (numero >= 80 && numero <= 120) return 'success';
        return 'warning';
      }
      if (edad >= 13 && edad <= 17) {
        if (numero < 50 || numero > 120) return 'danger';
        if (numero >= 60 && numero <= 100) return 'success';
        return 'warning';
      }
    }

    if (numero <= 40 || numero >= 130) return 'danger';
    if (numero >= 60 && numero <= 100) return 'success';

    return 'warning';
  }

  respiratory_rate_status(valor: any, edad?: number): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));

    if (numero === 0) return 'secondary';

    if (edad !== undefined) {
      if (edad < 1) {
        if (numero < 25 || numero > 50) return 'danger';
        if (numero >= 30 && numero <= 40) return 'success';
        return 'warning';
      }
      if (edad >= 1 && edad <= 2) {
        if (numero < 20 || numero > 45) return 'danger';
        if (numero >= 25 && numero <= 35) return 'success';
        return 'warning';
      }
      if (edad >= 3 && edad <= 5) {
        if (numero < 20 || numero > 40) return 'danger';
        if (numero >= 25 && numero <= 30) return 'success';
        return 'warning';
      }
      if (edad >= 6 && edad <= 12) {
        if (numero < 15 || numero > 35) return 'danger';
        if (numero >= 20 && numero <= 25) return 'success';
        return 'warning';
      }
      if (edad >= 13 && edad <= 17) {
        if (numero < 12 || numero > 28) return 'danger';
        if (numero >= 15 && numero <= 20) return 'success';
        return 'warning';
      }
    }

    if (numero <= 8 || numero >= 30) return 'danger';
    if (numero >= 12 && numero <= 20) return 'success';

    return 'warning';
  }

  systolic_status(valor: any, edad?: number): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));

    if (numero === 0) return 'secondary';

    if (edad !== undefined && edad < 18) {
      const pasMinima = Math.max(60, 70 + 2 * Math.min(edad, 10));
      if (numero < pasMinima || numero >= 140) return 'danger';
      if (numero >= pasMinima + 10 && numero <= 120) return 'success';
      return 'warning';
    }

    if (numero < 90 || numero >= 180) return 'danger';
    if (numero >= 100 && numero <= 139) return 'success';

    return 'warning';
  }

  diastolic_status(valor: any, edad?: number): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));

    if (numero === 0) return 'secondary';

    if (edad !== undefined && edad < 18) {
      if (numero < 40 || numero >= 90) return 'danger';
      if (numero >= 50 && numero <= 80) return 'success';
      return 'warning';
    }

    if (numero < 50 || numero >= 120) return 'danger';
    if (numero >= 60 && numero <= 89) return 'success';

    return 'warning';
  }

  saturation_status(valor: any): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));

    if (numero === 0) return 'secondary';
    if (numero < 92) return 'danger';
    if (numero >= 95) return 'success';

    return 'warning';
  }

  abdominal_perimeter_status(valor: any, sexo: string): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(0));
    const sexoNormalizado = this.to_upper(sexo);

    if (numero === 0) {
      return 'secondary';
    }

    if (sexoNormalizado === 'F' || sexoNormalizado === 'FEMENINO') {
      if (numero >= 88) return 'danger';
      if (numero < 80) return 'success';

      return 'warning';
    }

    if (numero >= 102) return 'danger';
    if (numero < 94) return 'success';

    return 'warning';
  }


  imc_status(valor: any): PaletteColor {
    const numero = Number(this.clear_number(valor).toFixed(2));

    if (numero === 0) return 'secondary';
    if (numero < 18.5 || numero >= 30) return 'danger';
    if (numero >= 18.5 && numero <25) return 'success';

    return 'warning';
  }

  imc_descripcion(valor: any): string {
    const numero = Number(this.clear_number(valor).toFixed(2));

    if (numero === 0) return '';
    if (numero < 18.5) return 'Bajo peso';
    if (numero < 25) return 'Peso normal';
    if (numero < 30) return 'Sobrepeso';
    if (numero < 35) return 'Obesidad grado I';
    if (numero < 40) return 'Obesidad grado II';

    return 'Obesidad grado III';
  }

  /** `talla` llega en centímetros desde los formularios de signos vitales. */
  calculate_imc(peso: any, talla: any): number {
    const pesoNumero = Number(this.clear_number(peso).toFixed(2));
    const tallaNumero = Number(this.clear_number(talla).toFixed(2));

    if (!pesoNumero || !tallaNumero) {return 0;}

    const tallaEnMetros = tallaNumero / 100;

    return Number((pesoNumero / (tallaEnMetros * tallaEnMetros)).toFixed(2));
  }

  /** Color de badge/estado (PaletteColor) para un nombre de color de catálogo
   *  (ROJO/NARANJA/AMARILLO/VERDE/AZUL). AZUL usa 'primary' porque, en la paleta
   *  del proyecto, --palette-primary (#0d6efd) es el azul real; --palette-info
   *  (#0dcaf0) es celeste/cian, no azul. Devuelve null si el nombre no coincide
   *  con ningún color conocido. */
  color_alerta(nombreColor: string): PaletteColor | null {
    const color = this.to_upper(nombreColor);
    if (color === 'ROJO') return 'danger';
    if (color === 'VERDE') return 'success';
    if (color === 'AMARILLO' || color === 'NARANJA') return 'warning';
    if (color === 'AZUL') return 'primary';
    return null;
  }

  /** Color literal (para los indicadores de prioridad de triaje) a partir del
   *  nombre de color de catálogo. No es un PaletteColor: estos indicadores usan
   *  su propia paleta de clases CSS (priority-option--red, etc.). */
  color_prioridad(nombreColor: string): string {
    const color = this.to_upper(nombreColor);
    if (color === 'ROJO') return 'red';
    if (color === 'NARANJA') return 'orange';
    if (color === 'AMARILLO') return 'yellow';
    if (color === 'VERDE') return 'green';
    if (color === 'AZUL') return 'blue';
    return 'gray';
  }

  /**
   * Resuelve el color de un signo vital usando el catálogo maestro: rangos normales por edad
   * (m_rango_param_clin) y niveles de alerta (m_param_niv_alerta). Ambos ya vienen graduados
   * por edad/severidad desde la base de datos. Devuelve null cuando el catálogo maestro no
   * tiene información aplicable, para que el llamador recurra a un cálculo de respaldo
   * (ver *_status de esta clase).
   */
  estado_desde_maestro(
    codigo: string,
    rawValue: string,
    edad: number,
    parametrosClinicos: readonly CatalogoParametroClinico[],
  ): PaletteColor | null {
    if (rawValue.trim() === '') return 'secondary';

    const value = Number(rawValue);
    if (!Number.isFinite(value)) return 'secondary';

    const parametro = parametrosClinicos.find((item) => item.codigo === codigo);

    const rangoNormal = parametro?.rangos_normales?.find(
      (rango) =>
        (rango.edad_minima === null || edad >= rango.edad_minima) &&
        (rango.edad_maxima === null || edad <= rango.edad_maxima) &&
        (rango.valor_minimo === null || value >= rango.valor_minimo) &&
        (rango.valor_maximo === null || value <= rango.valor_maximo),
    );
    if (rangoNormal) {
      return 'success';
    }

    const alerta = parametro?.niveles_alerta.find(
      (item) =>
        (item.valor_minimo === null || value >= item.valor_minimo) &&
        (item.valor_maximo === null || value <= item.valor_maximo),
    );
    if (!alerta) return null;

    const colorAlerta = this.color_alerta(alerta.color ?? '');
    if (colorAlerta) return colorAlerta;

    const severidad = this.to_upper(alerta.severidad ?? '');
    if (severidad === 'ALTA') return 'danger';
    if (severidad === 'MEDIA') return 'warning';
    if (severidad === 'BAJA') return 'success';

    return alerta.genera_alerta ? 'warning' : 'success';
  }

  /** Clases para una app-progress-bars usada como indicador de alerta de un signo vital. */
  progress_bar_classes(color: PaletteColor): string {
    return `progress app-progress-bars app-progress-bars--${color} app-progress-bars--sm mt-1`;
  }

}
