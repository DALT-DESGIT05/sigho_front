import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { vi } from 'vitest';
import { environment } from '../../../../../environments/environments';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { MESSAGE_CONFIRMATION_DEFAULT } from '../../../../config/constants';
import { UtilService } from '../../../../services/util.service';
import { AcompananteModalComponent } from '../../components/acompanante-modal/acompanante-modal.component';
import { AdmisionComponents } from './admision.components';

describe('AdmisionComponents', () => {
  let fixture: ComponentFixture<AdmisionComponents>;
  let component: AdmisionComponents;
  let http_testing: HttpTestingController;
  const util_service = { mostrar_alerta: vi.fn(), mostrar_error: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmisionComponents],
      providers: [
        provideRouter([{ path: 'emergencia/pacientes-triaje', component: AdmisionComponents }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UtilService, useValue: util_service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmisionComponents);
    component = fixture.componentInstance;
    http_testing = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http_testing
      .expectOne((req) => req.url === `${environment.baseUrl}v1/catalogos`)
      .flush({
      data: {
        tipos_documento: [{ value: 1, codigo: 'DNI', label: 'DNI' }],
        sexos: [
          { value: 1, codigo: 'M', label: 'Masculino' },
          { value: 2, codigo: 'F', label: 'Femenino' },
        ],
        parentescos: [{ value: 20, codigo: 'PAD', label: 'Padre' }],
        tipos_paciente: [
          { value: 1, codigo: 'T', label: 'Titular' },
          { value: 2, codigo: 'F', label: 'Familiar' },
          { value: 3, codigo: 'E', label: 'ExtraFap' },
        ],
        especialidades: [{ value: 13, label: 'Medicina Interna' }],
        procedencias: [{ value: 1, codigo: 'EME', label: 'Emergencia' }],
      },
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    http_testing
      .match((request) => request.url.includes('/v1/imagen/afiliado/'))
      .forEach((request) => request.flush(null, { status: 404, statusText: 'Not Found' }));
    http_testing.verify();
  });

  it('starts with a Signal Form for selecting an identified patient', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(component.admision_model()).toMatchObject({
      paciente_fap: true,
      paciente_extrafap: false,
      paciente_nn: false,
      procedencia_id: null,
      tipo_paciente_id: 1,
    });
    expect(component.admision_form().valid()).toBe(false);
    expect(text).not.toContain('HCE - EMERGENCIA: Admisión');
    expect(text).toContain('FAP');
    expect(text).toContain('EXTRAFAP');
    expect(text).toContain('NN');
    expect(text).not.toContain('Listado de admisiones');
    expect(text).not.toContain('Asignar horario');
    expect(text).not.toContain('Seleccionar horario');
  });

  it('does not create admission and requires procedencia to be selected', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_paciente({
      paciente_id: 123,
      persona_id: 123,
      tipo_documento_id: 10,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'ACTIVIDAD',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    component.admision_form.procedencia_id().value.set(null);
    expect(component.admision_model().procedencia_id).toBeNull();

    await component.guardar_admision();

    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/atenciones`);
    expect(component.error_campo('procedencia_id', 'atencion.procedencia_id')).toBe(
      'Este campo es obligatorio.',
    );
  });

  it('creates only the attention for a selected identified patient after confirmation', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_paciente({
      paciente_id: 123,
      persona_id: 123,
      tipo_documento_id: 10,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'ACTIVIDAD',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    component.admision_form.procedencia_id().value.set(1);
    await component.guardar_admision();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ text: MESSAGE_CONFIRMATION_DEFAULT }),
    );
    const request = http_testing.expectOne(`${environment.baseUrl}v1/emergencia/atenciones`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      paciente_id: 123,
      ind_discapacitado: false,
      atencion: {
        tipo_paciente_id: 1,
        procedencia_id: 1,
        numero_historia: '654321',
      },
    });
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/triajes`);
    request.flush({
      data: {
        atencion_id: 101,
        codigo_episodio: 'EME-00000101',
        paciente_id: 123,
        fecha_hora_ingreso: '2026-10-28 10:00:00',
        estado_codigo: 'PRE',
        estado_nombre: 'Preregistrada',
      },
    });

    expect(component.atencion_creada()?.codigo_episodio).toBe('EME-00000101');
  });

  it('places companion registration beside the compact patient search', () => {
    const element = fixture.nativeElement as HTMLElement;
    const search_row = element.querySelector('.patient-search-row');
    const button = search_row?.querySelector(
      'app-button button[title="Registrar acompañante"]',
    ) as HTMLButtonElement;

    expect(search_row?.querySelector('app-input-group')).not.toBeNull();
    expect(button.classList).toContain('app-button--secondary');
    expect(button.disabled).toBe(true);

    component.seleccionar_paciente({
      paciente_id: 123,
      persona_id: 123,
      codigo_afiliado: '00123456',
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'ACTIVIDAD',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    fixture.detectChanges();

    const acompanante_modal = fixture.debugElement.query(By.directive(AcompananteModalComponent))
      .componentInstance as AcompananteModalComponent;
    const open = vi.spyOn(acompanante_modal, 'open');
    button.click();

    expect(button.disabled).toBe(false);
    expect(acompanante_modal.pacienteId()).toBe(123);
    expect(acompanante_modal.tipoDocumentoOptions()[0]).toMatchObject({
      value: 1,
      codigo: 'DNI',
    });
    expect(acompanante_modal.sexoOptions()).toEqual([
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' },
    ]);
    expect(acompanante_modal.parentescoOptions()[0].value).toBe(20);
    expect(open).toHaveBeenCalledOnce();
  });

  it('shows the selected patient summary with affiliation and FAP details', () => {
    component.seleccionar_paciente({
      paciente_id: 123,
      persona_id: 123,
      codigo_afiliado: '00123456',
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: 'GARCÍA',
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'ACTIVIDAD',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('PÉREZ GARCÍA Juan');
    expect(text).toContain('12345678');
    expect(text).not.toContain('TITULAR - PÉREZ GARCÍA JUAN');
    expect(text).not.toContain('CORONEL');
    expect(text).toContain('654321');
    expect(text).toContain('ACTIVIDAD');
    expect(text).toContain('987654321');
    expect(text).toContain('juan@example.com');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-patient-identity'),
    ).not.toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-image-lazy')).not.toBeNull();
    expect(text).not.toContain('Serie');
  });

  it('updates the selected patient contact from the contact modal', () => {
    component.seleccionar_paciente({
      paciente_id: 123,
      persona_id: 123,
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'anterior@example.com',
      situacion: 'ACTIVIDAD',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    fixture.detectChanges();

    const modal = (
      component as unknown as { contacto_modal: () => ModalComponent }
    ).contacto_modal();
    vi.spyOn(modal, 'open').mockImplementation(() => undefined);
    vi.spyOn(modal, 'close').mockImplementation(() => undefined);

    component.abrir_modal_contacto('correo_electronico');

    expect(modal.open).toHaveBeenCalledOnce();
    expect(component.contacto_campo()).toBe('correo_electronico');
    expect(component.contacto_model().valor).toBe('anterior@example.com');

    component.contacto_model.set({ valor: 'nuevo@example.com' });
    component.guardar_contacto();

    const request = http_testing.expectOne(`${environment.baseUrl}v1/pacientes/contacto`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      persona_id: 123,
      celular: '987654321',
      correo_electronico: 'nuevo@example.com',
    });
    request.flush({
      data: {
        persona_id: 123,
        celular: '987654321',
        correo_electronico: 'nuevo@example.com',
      },
      message: 'Datos de contacto actualizados correctamente.',
    });

    expect(component.paciente_seleccionado()?.correo_electronico).toBe('nuevo@example.com');
    expect(modal.close).toHaveBeenCalledOnce();
    expect(util_service.mostrar_alerta).toHaveBeenCalledWith(
      'Datos de contacto actualizados correctamente.',
    );
  });

  it('materializes a selected SIFSA1 affiliate before opening companion registration', () => {
    component.seleccionar_paciente({
      paciente_id: null,
      persona_id: 123,
      origen: 'SIFSA1',
      codigo_afiliado: '00123456',
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'RETIRO',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });
    fixture.detectChanges();

    const acompanante_modal = fixture.debugElement.query(By.directive(AcompananteModalComponent))
      .componentInstance as AcompananteModalComponent;
    const open = vi.spyOn(acompanante_modal, 'open');
    component.abrir_modal_acompanante();

    const request = http_testing.expectOne(`${environment.baseUrl}v1/pacientes/fap`);
    expect(request.request.body).toEqual({ codigo_afiliado: '00123456' });
    request.flush({
      data: {
        paciente_id: 456,
        codigo_afiliado: '00123456',
        nsa: '654321',
        unidad_codigo: 721,
        grado_id: 17,
        es_nn: false,
      },
    });
    fixture.detectChanges();

    expect(component.paciente_seleccionado_id()).toBe(456);
    expect(acompanante_modal.pacienteId()).toBe(456);
    expect(open).toHaveBeenCalledOnce();
  });

  it('materializes a selected SIFSA1 affiliate before creating the attention', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_paciente({
      paciente_id: null,
      persona_id: 123,
      origen: 'SIFSA1',
      codigo_afiliado: '00123456',
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: 'Titular',
      tipo_afiliado: 'TITULAR',
      celular: '987654321',
      correo_electronico: 'juan@example.com',
      situacion: 'RETIRO',
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });

    component.admision_form.procedencia_id().value.set(1);
    await component.guardar_admision();

    const patient_request = http_testing.expectOne(`${environment.baseUrl}v1/pacientes/fap`);
    expect(patient_request.request.body).toEqual({ codigo_afiliado: '00123456' });
    patient_request.flush({
      data: {
        paciente_id: 456,
        codigo_afiliado: '00123456',
        nsa: '654321',
        unidad_codigo: 721,
        grado_id: 17,
        es_nn: false,
      },
    });
    const attention_request = http_testing.expectOne(
      `${environment.baseUrl}v1/emergencia/atenciones`,
    );
    expect(attention_request.request.body.paciente_id).toBe(456);
    expect(attention_request.request.body.atencion.tipo_paciente_id).toBe(1);
    attention_request.flush({
      data: {
        atencion_id: 105,
        codigo_episodio: 'EME-00000105',
        paciente_id: 456,
        fecha_hora_ingreso: '2026-10-30 13:30:00',
        estado_codigo: 'REG',
        estado_nombre: 'Registrada',
      },
    });
  });

  it('creates an NN patient before creating its attention and never posts triage', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_tipo_paciente('nn', true);
    component.admision_form.sexo().value.set('F');
    component.admision_form.procedencia_id().value.set(1);

    await component.guardar_admision();

    const patient_request = http_testing.expectOne(`${environment.baseUrl}v1/pacientes/nn`);
    patient_request.flush({ data: { paciente_id: 321 } });
    const attention_request = http_testing.expectOne(
      `${environment.baseUrl}v1/emergencia/atenciones`,
    );
    expect(attention_request.request.body.paciente_id).toBe(321);
    expect(attention_request.request.body.atencion.tipo_paciente_id).toBe(3);
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/triajes`);
    attention_request.flush({
      data: {
        atencion_id: 102,
        codigo_episodio: 'NN-00000102',
        paciente_id: 321,
        fecha_hora_ingreso: '2026-10-28 10:10:00',
        estado_codigo: 'PRE',
        estado_nombre: 'Preregistrada',
      },
    });
  });

  it('registers an EXTRAFAP patient before creating an ExtraFap attention', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_tipo_paciente('extrafap', true);
    component.busqueda_extrafap_realizada.set(true);
    component.admision_form.tipo_documento_id().value.set(1);
    component.admision_form.numero_documento().value.set('12345678');
    component.admision_form.nombres().value.set('JUAN');
    component.admision_form.apellido_paterno().value.set('PEREZ');
    component.admision_form.apellido_materno().value.set('GARCIA');
    component.admision_form.sexo().value.set('M');
    component.admision_form.correo_electronico().value.set('juan@example.com');
    component.admision_form.procedencia_id().value.set(1);

    await component.guardar_admision();

    const patient_request = http_testing.expectOne(`${environment.baseUrl}v1/pacientes/extrafap`);
    expect(patient_request.request.body).toEqual({
      tipo_documento_id: 1,
      numero_documento: '12345678',
      nombres: 'JUAN',
      apellido_paterno: 'PEREZ',
      apellido_materno: 'GARCIA',
      sexo_codigo: 'M',
      fecha_nacimiento: null,
      celular: null,
      correo_electronico: 'juan@example.com',
    });
    http_testing.expectNone(`${environment.baseUrl}v1/pacientes/nn`);
    patient_request.flush({ data: { paciente_id: 456, tipo_persona_fap: 2, es_nn: false } });

    const attention_request = http_testing.expectOne(
      `${environment.baseUrl}v1/emergencia/atenciones`,
    );
    expect(attention_request.request.body.paciente_id).toBe(456);
    expect(attention_request.request.body.atencion.tipo_paciente_id).toBe(3);
    attention_request.flush({
      data: {
        atencion_id: 103,
        codigo_episodio: 'EME-00000103',
        paciente_id: 456,
        fecha_hora_ingreso: '2026-10-28 10:20:00',
        estado_codigo: 'REG',
        estado_nombre: 'Registrada',
      },
    });
  });

  it('shows the EXTRAFAP registration form only after a search returns no results', () => {
    component.seleccionar_tipo_paciente('extrafap', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Tipo de documento');

    component.buscar_pacientes_extrafap('SIN RESULTADOS').subscribe();
    http_testing
      .expectOne(
        `${environment.baseUrl}v1/pacientes/buscar?termino=SIN%20RESULTADOS&tipo_paciente=EXTRAFAP`,
      )
      .flush({ data: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Tipo de documento');
  });

  it('reuses a registered EXTRAFAP patient when creating its attention', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_tipo_paciente('extrafap', true);
    component.seleccionar_paciente({
      paciente_id: 456,
      persona_id: 456,
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      apellido_paterno: 'PÉREZ',
      apellido_materno: null,
      nombres: 'JUAN',
      nsa: '654321',
      parentesco: null,
      tipo_afiliado: null,
      celular: null,
      correo_electronico: null,
      situacion: null,
      sexo: 'Masculino',
      edad: 30,
      ind_discapacitado: false,
    });

    component.admision_form.procedencia_id().value.set(1);
    await component.guardar_admision();

    http_testing.expectNone(`${environment.baseUrl}v1/pacientes/extrafap`);
    const attention_request = http_testing.expectOne(
      `${environment.baseUrl}v1/emergencia/atenciones`,
    );
    expect(attention_request.request.body).toEqual({
      paciente_id: 456,
      ind_discapacitado: false,
      atencion: {
        tipo_paciente_id: 3,
        procedencia_id: 1,
        numero_historia: '654321',
      },
    });
    attention_request.flush({
      data: {
        atencion_id: 104,
        codigo_episodio: 'EXT-00000104',
        paciente_id: 456,
        fecha_hora_ingreso: '2026-10-30 13:20:00',
        estado_codigo: 'REG',
        estado_nombre: 'Registrada',
      },
    });
  });

  it('shows required-field errors only after attempting to create the admission', async () => {
    const error_elements = (): number =>
      (fixture.nativeElement as HTMLElement).querySelectorAll('.app-input-text__error, .app-select__error').length;

    component.seleccionar_tipo_paciente('extrafap', true);
    component.busqueda_extrafap_realizada.set(true);
    component.admision_form.numero_documento().markAsTouched();
    fixture.detectChanges();

    expect(component.error_campo('numero_documento', 'numero_documento')).toBe('');
    expect(error_elements()).toBe(0);

    await component.guardar_admision();
    fixture.detectChanges();

    expect(component.error_campo('numero_documento', 'numero_documento')).toBe(
      'Este campo es obligatorio.',
    );
    expect(component.error_campo('nombres', 'nombres')).toBe('Este campo es obligatorio.');
    expect(error_elements()).toBeGreaterThan(0);

    component.seleccionar_tipo_paciente('nn', true);
    fixture.detectChanges();

    expect(component.error_campo('sexo', 'sexo_codigo')).toBe('');
    expect(error_elements()).toBe(0);

    await component.guardar_admision();
    fixture.detectChanges();

    expect(component.error_campo('sexo', 'sexo_codigo')).toBe('Este campo es obligatorio.');
    expect(error_elements()).toBeGreaterThan(0);

    component.seleccionar_tipo_paciente('fap', true);
    fixture.detectChanges();

    expect(component.error_paciente()).toBe('');

    await component.guardar_admision();
    fixture.detectChanges();

    expect(component.error_paciente()).toBe('Seleccione un paciente registrado.');
  });

  it('reuses the NN patient when attention creation is retried', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    component.seleccionar_tipo_paciente('nn', true);
    component.admision_form.sexo().value.set('F');
    component.admision_form.procedencia_id().value.set(1);

    await component.guardar_admision();
    http_testing.expectOne(`${environment.baseUrl}v1/pacientes/nn`).flush({
      data: { paciente_id: 321 },
    });
    http_testing
      .expectOne(`${environment.baseUrl}v1/emergencia/atenciones`)
      .flush(
        { message: 'No existe una programación vigente.' },
        { status: 409, statusText: 'Conflict' },
      );

    await component.guardar_admision();

    http_testing.expectNone(`${environment.baseUrl}v1/pacientes/nn`);
    const retry_request = http_testing.expectOne(`${environment.baseUrl}v1/emergencia/atenciones`);
    expect(retry_request.request.body.paciente_id).toBe(321);
    retry_request.flush({
      data: {
        atencion_id: 102,
        codigo_episodio: 'NN-00000102',
        paciente_id: 321,
        fecha_hora_ingreso: '2026-10-28 10:10:00',
        estado_codigo: 'REG',
        estado_nombre: 'Registrada',
      },
    });
  });

  it('keeps only one patient type selected', () => {
    component.seleccionar_tipo_paciente('extrafap', true);

    expect(component.admision_model()).toMatchObject({
      paciente_fap: false,
      paciente_extrafap: true,
      paciente_nn: false,
    });

    component.seleccionar_tipo_paciente('nn', true);

    expect(component.admision_model()).toMatchObject({
      paciente_fap: false,
      paciente_extrafap: false,
      paciente_nn: true,
      prioridad: 'I',
    });
  });

  it('sets priority I automatically as a marked circle when NN patient is selected', () => {
    component.seleccionar_tipo_paciente('nn', true);
    fixture.detectChanges();

    expect(component.admision_model().prioridad).toBe('I');
    expect(component.prioridad_actual()).toEqual({
      value: 'I',
      label: 'Resucitación',
      color: 'red',
    });

    const compiled = fixture.nativeElement as HTMLElement;
    const checkedRadio = compiled.querySelector<HTMLInputElement>(
      '.priority-option input[type="radio"]:checked',
    );
    expect(checkedRadio?.value).toBe('I');
    expect(compiled.querySelectorAll('.priority-option input[type="radio"]')).toHaveLength(1);

    const badge = compiled.querySelector('.priority-badge-info');
    expect(badge?.textContent).toContain('I - Resucitación');
    expect(badge?.textContent).not.toContain('Prioridad I');
    expect(badge?.textContent).toContain('Resucitación');
  });

  it('navigates back to the queue after displaying the created episode', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.volver_a_cola();

    expect(navigate).toHaveBeenCalledWith(['/emergencia/pacientes-triaje']);
  });
});
