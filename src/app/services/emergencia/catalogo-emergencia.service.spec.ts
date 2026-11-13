import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CatalogoEmergenciaService } from './catalogo-emergencia.service';

describe('CatalogoEmergenciaService', () => {
  it('loads the typed Emergencia catalogs from the backend', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(CatalogoEmergenciaService);
    const httpTesting = TestBed.inject(HttpTestingController);

    const responsePromise = firstValueFrom(service.obtenerCatalogos());
    const request = httpTesting.expectOne(`${environment.baseUrl}v1/catalogos`);
    request.flush({
      status: true,
      code: 200,
      errors: [],
      data: {
        tipos_documento: [{ value: 1, codigo: 'DNI', label: 'Documento Nacional de Identidad' }],
        sexos: [{ value: 1, codigo: 'M', label: 'Masculino' }],
        parentescos: [{ value: 1, codigo: 'CONY', label: 'Cónyuge' }],
        condiciones_llegada: [{ value: 2, label: 'Ambulatorio' }],
        motivos_ingreso: [{ value: 3, label: 'Accidente' }],
        tipos_paciente: [{ value: 1, codigo: 'T', label: 'Titular' }],
        especialidades: [{ value: 13, label: 'Medicina Interna' }],
        ipress: [{ value: 721, label: 'Hospital Central FAP' }],
        procedencias: [{ value: 1, codigo: 'EME', label: 'Emergencia' }],
        areas: [{ value: 8, codigo: 'CONS', label: 'Consultorios' }],
        niveles_triaje: [],
      },
      message: null,
      identifier: '',
      last_activity: null,
    });

    await expect(responsePromise).resolves.toMatchObject({
      data: {
        tipos_documento: [{ value: 1, codigo: 'DNI', label: 'Documento Nacional de Identidad' }],
        sexos: [{ value: 1, codigo: 'M', label: 'Masculino' }],
        parentescos: [{ value: 1, codigo: 'CONY', label: 'Cónyuge' }],
        condiciones_llegada: [{ value: 2, label: 'Ambulatorio' }],
        motivos_ingreso: [{ value: 3, label: 'Accidente' }],
      },
    });
    const cachedResponsePromise = firstValueFrom(service.obtenerCatalogos());
    httpTesting.expectNone(`${environment.baseUrl}v1/catalogos`);
    await expect(cachedResponsePromise).resolves.toMatchObject({
      data: { condiciones_llegada: [{ value: 2, label: 'Ambulatorio' }] },
    });
    httpTesting.verify();
  });

  it('loads the vital-sign masters from the backend', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(CatalogoEmergenciaService);
    const httpTesting = TestBed.inject(HttpTestingController);

    const responsePromise = firstValueFrom(service.obtenerSignosVitales());
    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/catalogos/signos-vitales`,
    );
    request.flush({
      status: true,
      code: 200,
      errors: [],
      data: {
        parametros: [
          {
            codigo: 'TEMP',
            nombre: 'Temperatura',
            tipo_parametro: 'Signo vital',
            tipo_dato: 'DECIMAL',
            cantidad_decimales: 1,
            valor_minimo_admisible: 25,
            valor_maximo_admisible: 45,
            unidad_medida_id: 266,
            unidad_medida_nombre: 'GRADOS CELSIUS',
            requiere_componentes: false,
            componentes: [],
            rangos_normales: [],
            niveles_alerta: [],
          },
        ],
      },
      message: null,
      identifier: '',
      last_activity: null,
    });

    await expect(responsePromise).resolves.toMatchObject({
      data: { parametros: [{ codigo: 'TEMP' }] },
    });
    const cachedResponsePromise = firstValueFrom(service.obtenerSignosVitales());
    httpTesting.expectNone(`${environment.baseUrl}v1/catalogos/signos-vitales`);
    await expect(cachedResponsePromise).resolves.toMatchObject({
      data: { parametros: [{ codigo: 'TEMP' }] },
    });
    httpTesting.verify();
  });
});
