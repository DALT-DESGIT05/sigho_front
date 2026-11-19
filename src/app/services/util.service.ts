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
    const autoTimer = tiempo ?? (icono === 'success' ? 1200 : 3500);
    Swal.fire({
      toast: true,
      position: 'top-end',
      title: mensaje,
      icon: icono,
      customClass: {
        popup: 'sigho-toast',
      },
      timer: autoTimer,
      timerProgressBar: autoTimer !== undefined,
      showConfirmButton: false,
    });
  }

  mostrar_error(mensaje?: string, tiempo?: number): void {
    this.mostrar_alerta(mensaje ?? MESSAGE_ERROR_DEFAULT, 'error', tiempo);
  }

  async confirmar_eliminacion(opciones?: {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: opciones?.title ?? '¿Está seguro de eliminar este registro?',
      text: opciones?.text ?? 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: opciones?.confirmButtonText ?? 'Sí, eliminar',
      cancelButtonText: opciones?.cancelButtonText ?? 'Cancelar',
    });

    return Boolean(result.isConfirmed);
  }

  async confirmar_accion(opciones: {
    title: string;
    text: string;
    icon?: 'warning' | 'question' | 'info';
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColor?: string;
    cancelButtonColor?: string;
    reverseButtons?: boolean;
    allowOutsideClick?: boolean;
    allowEscapeKey?: boolean;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: opciones.title,
      text: opciones.text,
      icon: opciones.icon ?? 'question',
      showCancelButton: true,
      confirmButtonColor: opciones.confirmButtonColor ?? '#3085d6',
      cancelButtonColor: opciones.cancelButtonColor ?? '#6c757d',
      confirmButtonText: opciones.confirmButtonText ?? 'Sí, continuar',
      cancelButtonText: opciones.cancelButtonText ?? 'Cancelar',
      reverseButtons: opciones.reverseButtons,
      allowOutsideClick: opciones.allowOutsideClick ?? true,
      allowEscapeKey: opciones.allowEscapeKey ?? true,
    });

    return Boolean(result.isConfirmed);
  }

  mostrar_aviso(opciones: {
    title: string;
    text?: string;
    html?: string;
    icon?: 'warning' | 'info' | 'error' | 'success';
    confirmButtonText?: string;
    confirmButtonColor?: string;
  }): Promise<void> {
    return Swal.fire({
      title: opciones.title,
      text: opciones.text,
      html: opciones.html,
      icon: opciones.icon ?? 'warning',
      confirmButtonText: opciones.confirmButtonText ?? 'Entendido',
      confirmButtonColor: opciones.confirmButtonColor ?? '#3085d6',
    }).then(() => undefined);
  }

  async solicitar_texto(opciones: {
    title: string;
    subtitulo?: string;
    placeholder?: string;
    valorInicial?: string;
    multilinea?: boolean;
    maxlength?: number;
    confirmButtonText?: string;
    cancelButtonText?: string;
  }): Promise<string | null> {
    const result = await Swal.fire({
      title: opciones.title,
      html: opciones.subtitulo
        ? `<div style="text-align:left;font-size:13px;color:#4b5563;margin-bottom:8px;">${opciones.subtitulo}</div>`
        : undefined,
      input: opciones.multilinea ? 'textarea' : 'text',
      inputValue: opciones.valorInicial ?? '',
      inputPlaceholder: opciones.placeholder ?? 'Ingrese las especificaciones...',
      inputAttributes: {
        maxlength: String(opciones.maxlength ?? 500),
        ...(opciones.multilinea ? { rows: '4', style: 'font-size: 13px; resize: vertical;' } : {}),
      },
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: opciones.confirmButtonText ?? 'Aceptar',
      cancelButtonText: opciones.cancelButtonText ?? 'Cancelar',
    });

    return result.isConfirmed && typeof result.value === 'string' ? result.value.trim() : null;
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

    const stringVal = String(value).replace(',', '.');
    const numericValue = Number(stringVal);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }


  only_number_value(value: unknown): string {
    return this.clear_null(value).replace(/\D/g, '');
  }


  prevent_paste(event: ClipboardEvent): void {
    event.preventDefault();
  }


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


  format_number(value: unknown, decimals = 2): string {
    const fractionDigits = Math.max(0, decimals);
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(this.clear_number(value));
  }


  format_currency_pen(value: unknown, decimals = 2): string {
    const fractionDigits = Math.max(0, decimals);
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(this.clear_number(value));
  }


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
    const valor = this.to_upper(situacion);

    if (
      [
        'PROCESADO',
        'PROCESADA',
        'COMPLETADO',
        'FINALIZADO',
        'VALIDADO',
        'ATENDIDO',
        'ATENDIDA',
        'INFORMADO',
        'RESULTADO FINAL',
        'EJECUTADA',
        'EJECUTADO',
        'FIRMADA',
        'FIRMADO',
        'ALTA MEDICA',
        'EGRESADA',
        'EGRESADO',
      ].some((item) => valor.includes(item))
    ) {
      return 'success';
    }

    if (
      [
        'EN PROCESO',
        'PROCESANDO',
        'RESULTADO PARCIAL',
        'PARCIALMENTE EJECUTADA',
        'ACEPTADA',
        'ACTIVA',
        'ACTIVO',
        'CONFIRMADA',
        'CONFIRMADO',
      ].some((item) => valor.includes(item))
    ) {
      return 'info';
    }

    if (
      [
        'PENDIENTE',
        'SOLICITADA',
        'SOLICITADO',
        'REGISTRADA',
        'REGISTRADO',
        'PROGRAMADO',
        'PROGRAMADA',
        'EN ESPERA',
      ].some((item) => valor.includes(item))
    ) {
      return 'warning';
    }

    if (
      [
        'ANULADO',
        'ANULADA',
        'CANCELADO',
        'CANCELADA',
        'RECHAZADO',
        'RECHAZADA',
        'SUSPENDIDO',
        'SUSPENDIDA',
        'VENCIDO',
        'VENCIDA',
        'FALLECIDO',
        'FALLECIDA',
      ].some((item) => valor.includes(item))
    ) {
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

    if (event.key === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    if (event.key < '0' || event.key > '9') {
      event.preventDefault();
    }

    const punto = input.value.indexOf('.');

    if (punto !== -1) {
      const decimales = input.value.substring(punto + 1);

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


  calculate_imc(peso: any, talla: any): number {
    const pesoNumero = Number(this.clear_number(peso).toFixed(2));
    const tallaNumero = Number(this.clear_number(talla).toFixed(2));

    if (!pesoNumero || !tallaNumero) {return 0;}

    const tallaEnMetros = tallaNumero / 100;

    return Number((pesoNumero / (tallaEnMetros * tallaEnMetros)).toFixed(2));
  }






  color_alerta(nombreColor: string): PaletteColor | null {
    const color = this.color_prioridad(nombreColor);
    if (color === 'red') return 'danger';
    if (color === 'green') return 'success';
    if (color === 'yellow' || color === 'orange') return 'warning';
    if (color === 'blue') return 'primary';
    return null;
  }




  color_prioridad(nombreColor: string): string {
    const color = this.to_upper(nombreColor);
    if (color === 'ROJO') return 'red';
    if (color === 'NARANJA') return 'orange';
    if (color === 'AMARILLO') return 'yellow';
    if (color === 'VERDE') return 'green';
    if (color === 'AZUL') return 'blue';
    return 'gray';
  }








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


  progress_bar_classes(color: PaletteColor): string {
    return `progress app-progress-bars app-progress-bars--${color} app-progress-bars--sm mt-1`;
  }

}
