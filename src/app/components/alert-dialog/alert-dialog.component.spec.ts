import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AlertDialogComponent, AlertDialogTipo } from './alert-dialog.component';

describe('AlertDialogComponent', () => {
  let fixture: ComponentFixture<AlertDialogComponent>;
  let componente: AlertDialogComponent;
  let dialogo: HTMLDialogElement;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [AlertDialogComponent] }).compileComponents();
    fixture = TestBed.createComponent(AlertDialogComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
    dialogo = fixture.nativeElement.querySelector('dialog');
    // JSDOM no implementa la capa superior ni el foco nativo de dialog.
    dialogo.showModal = () => dialogo.setAttribute('open', '');
    dialogo.close = () => dialogo.removeAttribute('open');
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  for (const diseno of ['horizontal', 'centrado'] as const) {
    for (const tipo of ['success', 'error', 'warning', 'info', 'confirm'] as AlertDialogTipo[]) {
      it(`renderiza ${tipo} en diseño ${diseno}`, async () => {
        const resultado = componente.open({ diseno, tipo, titulo: 'Título', mensaje: 'Mensaje' });
        expect(dialogo.classList.contains(`alert-dialog--${diseno}`)).toBe(true);
        expect(dialogo.classList.contains(`alert-dialog--${tipo}`)).toBe(true);
        expect(dialogo.style.width).toBe(diseno === 'centrado' ? '350px' : '460px');
        expect(!!dialogo.querySelector('header')).toBe(diseno === 'horizontal');
        expect(!!dialogo.querySelector('footer')).toBe(diseno === 'centrado');
        expect(dialogo.querySelectorAll('button').length).toBe(tipo === 'confirm' ? 2 : 1);
        componente.confirmar();
        await vi.runAllTimersAsync();
        expect(await resultado).toBe(true);
      });
    }
  }

  it('conserva horizontal por defecto y respeta ancho personalizado en centrado', async () => {
    void componente.open({ titulo: 'Anterior', mensaje: '' });
    expect(dialogo.classList.contains('alert-dialog--horizontal')).toBe(true);
    expect(dialogo.style.width).toBe('460px');
    componente.close();
    await vi.runAllTimersAsync();
    void componente.open({ diseno: 'centrado', ancho: '310px', titulo: 'Personalizada', mensaje: '', imagen: 'svg-presencial' });
    expect(dialogo.style.width).toBe('310px');
    expect(dialogo.querySelector('img')).toBeTruthy();
    expect(dialogo.querySelector('img')!.getAttribute('src')).toBe('images/svg-presencial.png');
    dialogo.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(dialogo.querySelector('i.fa-circle-info')).toBeTruthy();
  });

  it('resuelve una sola confirmación y restaura el scroll', async () => {
    const overflow_anterior = document.documentElement.style.overflow;
    const cerrado = vi.fn();
    componente.closed.subscribe(cerrado);
    const resultado = componente.open({ tipo: 'confirm', titulo: 'Eliminar', mensaje: '¿Continuar?' });
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(dialogo.querySelectorAll('button').length).toBe(2);
    expect(componente.open({ titulo: 'Duplicada', mensaje: '' })).toBe(resultado);
    componente.confirmar();
    componente.cancelar();
    await vi.runAllTimersAsync();
    expect(await resultado).toBe(true);
    expect(cerrado).toHaveBeenCalledExactlyOnceWith(true);
    expect(document.documentElement.style.overflow).toBe(overflow_anterior);
  });

  it('usa azul institucional por defecto y permite personalizar el botón', async () => {
    void componente.open({ tipo: 'success', titulo: 'Éxito', mensaje: '' });
    expect(dialogo.querySelector('[data-confirmar] button')?.classList.contains('app-button--primary')).toBe(true);
    componente.close();
    await vi.runAllTimersAsync();
    void componente.open({ tipo: 'confirm', titulo: 'Eliminar', mensaje: '', color_confirmar: 'danger' });
    expect(dialogo.querySelector('[data-confirmar] button')?.classList.contains('app-button--danger')).toBe(true);
    expect(dialogo.querySelectorAll('button').length).toBe(2);
  });

  it('respeta la configuración de Escape', async () => {
    const resultado = componente.open({ titulo: 'Aviso', mensaje: 'Mensaje', cerrar_escape: false });
    dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
    await vi.runAllTimersAsync();
    expect(dialogo.open).toBe(true);
    componente.close();
    await vi.runAllTimersAsync();
    expect(await resultado).toBe(false);
  });

  it('cancela con Escape por defecto', async () => {
    const resultado = componente.open({ titulo: 'Aviso', mensaje: 'Mensaje' });
    dialogo.dispatchEvent(new Event('cancel', { cancelable: true }));
    await vi.runAllTimersAsync();
    expect(await resultado).toBe(false);
  });

  it('sustituye el icono por PNG y recupera el icono si falla', () => {
    void componente.open({ titulo: 'Aviso', mensaje: '', imagen: 'images/3305803.png' });
    expect(dialogo.querySelector('img')).toBeTruthy();
    dialogo.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(dialogo.querySelector('img')).toBeNull();
    expect(dialogo.querySelector('i.fa-circle-info')).toBeTruthy();
  });

  it('solo cancela desde el fondo cuando está permitido', async () => {
    const resultado = componente.open({ titulo: 'Aviso', mensaje: '', cerrar_fuera: true });
    dialogo.dispatchEvent(new MouseEvent('click', { clientX: -10, clientY: -10 }));
    await vi.runAllTimersAsync();
    expect(await resultado).toBe(false);
  });

  it('mantiene el bloqueo mientras otra instancia siga abierta', async () => {
    const otra_fixture = TestBed.createComponent(AlertDialogComponent);
    otra_fixture.detectChanges();
    const otro_dialogo = otra_fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    otro_dialogo.showModal = () => otro_dialogo.setAttribute('open', '');
    otro_dialogo.close = () => otro_dialogo.removeAttribute('open');
    const overflow_anterior = document.documentElement.style.overflow;
    void componente.open({ titulo: 'Primera', mensaje: '' });
    void otra_fixture.componentInstance.open({ titulo: 'Segunda', mensaje: '' });
    componente.close();
    await vi.runAllTimersAsync();
    expect(document.documentElement.style.overflow).toBe('hidden');
    otra_fixture.destroy();
    expect(document.documentElement.style.overflow).toBe(overflow_anterior);
  });

  it('restaura el foco y resuelve false al destruirse', async () => {
    const origen = document.createElement('button');
    document.body.appendChild(origen);
    origen.focus();
    const resultado = componente.open({ titulo: 'Aviso', mensaje: '' });
    fixture.destroy();
    expect(await resultado).toBe(false);
    expect(document.activeElement).toBe(origen);
    origen.remove();
  });
});
