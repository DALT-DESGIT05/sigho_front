import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';
import { AfiliadoService } from '../../../../services/citas/afiliado.service';
import { AcompananteService } from '../../../../services/emergencia/acompanante.service';
import { UtilService } from '../../../../services/util.service';
import { AcompananteModalComponent } from './acompanante-modal.component';

const listAfiliados = vi.fn(() =>
  of({
    message: 'OK',
    data: [
      { historia: 'HC-100', codigo_afiliado: 'AF-100', apellidos: 'Pérez Soto', nombres: 'Ana' },
    ],
  }),
);

const fichaAfiliado = vi.fn(() =>
  of({
    message: 'OK',
    data: {
      cod_afiliado: 'AF-100',
      dni: '12345678',
      historia: 'HC-100',
      parentesco: 'Cónyuge',
      telefono: '999888777',
      telefonos: [],
      correo: 'ana@example.com',
      situacion: 'ACTIVO',
      apellido_paterno: 'Pérez',
      apellido_materno: 'Soto',
      nombres: 'Ana',
    },
  }),
);

const registrarAcompanante = vi.fn(() =>
  of({
    status: true,
    code: 200,
    errors: [],
    data: {
      paciente_id: 10,
      acompanante_id: 90,
      tipo_documento_id: 1,
      numero_documento: '12345678',
      nombres: 'ANA',
      apellido_paterno: 'PÉREZ',
      apellido_materno: 'SOTO',
      parentesco_id: 1,
      parentesco: 'Cónyuge',
      tipo_acompanante: 1 as const,
    },
    message: 'Acompañante registrado y vinculado correctamente.',
    identifier: '',
    last_activity: null,
  }),
);

const buscarAcompanantes = vi.fn(() =>
  of({
    data: [
      {
        persona_id: 80,
        registrado_como_acompanante: false,
        tipo_documento_id: 1,
        tipo_documento: 'DNI',
        numero_documento: '87654321',
        apellido_paterno: 'RAMÍREZ',
        apellido_materno: 'DÍAZ',
        nombres: 'LUISA',
        sexo_codigo: 'F',
        sexo: 'Femenino',
        fecha_nacimiento: '1985-03-20',
        celular: '988777666',
        correo_electronico: 'luisa@example.com',
        tipo_persona_fap: 0 as const,
      },
    ],
  }),
);

const utilService = {
  mostrar_alerta: vi.fn(),
  mostrar_error: vi.fn(),
};

describe('AcompananteModalComponent', () => {
  let fixture: ComponentFixture<AcompananteModalComponent>;
  let component: AcompananteModalComponent;

  beforeEach(async () => {
    listAfiliados.mockClear();
    fichaAfiliado.mockClear();
    registrarAcompanante.mockClear();
    buscarAcompanantes.mockClear();
    utilService.mostrar_alerta.mockClear();
    utilService.mostrar_error.mockClear();

    await TestBed.configureTestingModule({
      imports: [AcompananteModalComponent],
      providers: [
        { provide: BsModalService, useValue: { show: vi.fn(), hide: vi.fn() } },
        {
          provide: AfiliadoService,
          useValue: {
            list_afiliados_by_text: listAfiliados,
            ficha_afiliado: fichaAfiliado,
          },
        },
        {
          provide: AcompananteService,
          useValue: { buscar: buscarAcompanantes, registrar: registrarAcompanante },
        },
        { provide: UtilService, useValue: utilService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AcompananteModalComponent);
    fixture.componentRef.setInput('pacienteId', 10);
    fixture.componentRef.setInput('tipoDocumentoOptions', [
      { value: 1, label: 'Documento Nacional de Identidad', codigo: 'DNI' },
    ]);
    fixture.componentRef.setInput('sexoOptions', [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
    ]);
    fixture.componentRef.setInput('parentescoOptions', [
      { value: 1, label: 'Cónyuge', codigo: 'CONY' },
    ]);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes the Signal Forms model and search state', () => {
    expect(Object.keys(component.acompanante_model())).toEqual([
      'fap',
      'extrafap',
      'tipoDocumentoId',
      'numero',
      'sexoCodigo',
      'fechaNacimiento',
      'apellidoPaterno',
      'apellidoMaterno',
      'nombres',
      'parentescoId',
      'celular',
      'correoElectronico',
    ]);
    expect(component.acompanante_form().valid()).toBe(false);
  });

  it('keeps FAP and EXTRAFAP mutually exclusive', () => {
    component.cambiar_fap(true);
    expect(component.acompanante_model()).toMatchObject({ fap: true, extrafap: false });

    component.cambiar_extrafap(true);
    expect(component.acompanante_model()).toMatchObject({ fap: false, extrafap: true });
  });

  it('does not submit an invalid Signal Form', () => {
    component.guardar();

    expect(registrarAcompanante).not.toHaveBeenCalled();
    expect(utilService.mostrar_alerta).toHaveBeenCalledWith(
      'Complete los datos obligatorios del acompañante.',
      'warning',
    );
  });

  it('synchronizes a shared input through its public value binding', async () => {
    component.actualizar_texto('numero', '12345678');

    expect(component.acompanante_model().numero).toBe('12345678');
  });

  it('searches EXTRAFAP people in the local person registry', async () => {
    component.cambiar_extrafap(true);
    const results = await firstValueFrom(component.buscar_acompanantes('Luisa Ramírez'));

    expect(buscarAcompanantes).toHaveBeenCalledWith('Luisa Ramírez', 0, 10);
    expect(listAfiliados).not.toHaveBeenCalled();
    expect(results[0]).toMatchObject({
      id: 'PERSONA-80',
      label: '87654321 — RAMÍREZ DÍAZ LUISA',
    });
  });

  it('fills the companion form from an existing local person', async () => {
    component.cambiar_extrafap(true);
    const [persona] = await firstValueFrom(component.buscar_acompanantes('Luisa Ramírez'));
    component.seleccionar_acompanante(persona);

    expect(component.acompanante_model()).toMatchObject({
      fap: false,
      extrafap: true,
      tipoDocumentoId: 1,
      numero: '87654321',
      sexoCodigo: 'F',
      fechaNacimiento: '1985-03-20',
      apellidoPaterno: 'RAMÍREZ',
      apellidoMaterno: 'DÍAZ',
      nombres: 'LUISA',
      celular: '988777666',
      correoElectronico: 'luisa@example.com',
    });
  });

  it('falls back to SIFSA1 when no local FAP person matches', async () => {
    buscarAcompanantes.mockReturnValueOnce(of({ data: [] }));
    component.cambiar_fap(true);
    const [afiliado] = await firstValueFrom(component.buscar_acompanantes('Ana'));

    expect(buscarAcompanantes).toHaveBeenCalledWith('Ana', 1, 10);
    expect(listAfiliados).toHaveBeenCalledWith('Ana', 'Ana', 'Ana', 'Ana');
    expect(afiliado).toMatchObject({ id: 'SIFSA1-AF-100', label: 'HC-100 — Pérez Soto Ana' });

    component.seleccionar_acompanante(afiliado);

    expect(fichaAfiliado).toHaveBeenCalledWith('AF-100');
    expect(component.acompanante_model()).toEqual({
      fap: true,
      extrafap: false,
      tipoDocumentoId: 1,
      numero: '12345678',
      sexoCodigo: '',
      fechaNacimiento: '',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'Soto',
      nombres: 'Ana',
      parentescoId: 1,
      celular: '999888777',
      correoElectronico: 'ana@example.com',
    });
  });

  it('registers and links the companion to the selected patient', () => {
    const registered = vi.fn();
    component.registrado.subscribe(registered);
    component.acompanante_model.set({
      fap: true,
      extrafap: false,
      tipoDocumentoId: 1,
      numero: '12345678',
      sexoCodigo: 'F',
      fechaNacimiento: '1990-05-10',
      apellidoPaterno: 'PÉREZ',
      apellidoMaterno: 'SOTO',
      nombres: 'ANA',
      parentescoId: 1,
      celular: '999888777',
      correoElectronico: 'ana@example.com',
    });

    component.guardar();

    expect(registrarAcompanante).toHaveBeenCalledWith(
      {
        paciente_id: 10,
        tipo_documento_id: 1,
        numero_documento: '12345678',
        sexo_codigo: 'F',
        nombres: 'ANA',
        apellido_paterno: 'PÉREZ',
        apellido_materno: 'SOTO',
        fecha_nacimiento: '1990-05-10',
        parentesco_id: 1,
        tipo_acompanante: 1,
        celular: '999888777',
        correo_electronico: 'ana@example.com',
      },
      true,
    );
    expect(registered).toHaveBeenCalledWith(expect.objectContaining({ acompanante_id: 90 }));
    expect(utilService.mostrar_alerta).toHaveBeenCalledWith(
      'Acompañante registrado y vinculado correctamente.',
    );
  });

  it('delegates opening and closing to the shared modal', () => {
    const open = vi.spyOn(component.modal(), 'open');
    const close = vi.spyOn(component.modal(), 'close');

    component.open();
    component.cerrar_modal();

    expect(open).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it('separates itself visually when opened above another modal', () => {
    fixture.componentRef.setInput('separateFromParent', true);
    fixture.detectChanges();

    expect(component.modal().modalDialogClasses()).toContain('app-modal--separated');
  });
});
