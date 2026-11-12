import { TestBed } from '@angular/core/testing';
import { ImagenPipe } from './imagen.pipe';

describe('ImagenPipe', () => {
  let pipe: ImagenPipe;

  beforeEach(() => {
    pipe = TestBed.runInInjectionContext(() => new ImagenPipe());
  });

  it('resuelve nombres y permite seleccionar extensiones explícitas', () => {
    expect(pipe.transform('logo')).toBe('images/logo.png');
    expect(pipe.transform('presencial')).toBe('images/presencial.png');
    expect(pipe.transform('presencial.svg')).toBe('images/presencial.svg');
    expect(pipe.transform('svg-presencial')).toBe('images/svg-presencial.png');
  });

  it('codifica espacios y conserva URLs y rutas de consumidores', () => {
    expect(pipe.transform('agendar cita')).toBe('images/agendar%20cita.png');
    for (const url of ['https://example.com/foto.png', 'blob:foto', 'data:image/png;base64,abc', 'images/logo.png']) {
      expect(pipe.transform(url)).toBe(url);
    }
  });

  it('admite entradas vacías', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('resuelve alias manuales sin renombrar los archivos numéricos', () => {
    expect(pipe.transform('cardiologia')).toBe('images/002.png');
    expect(pipe.transform('cirugia_general')).toBe('images/003.png');
    expect(pipe.transform('hospital_las_palmas')).toBe('images/823.png');
    expect(pipe.transform('002')).toBe('images/002.png');
    expect(pipe.transform('cardiologia.svg')).toBe('images/cardiologia.svg');
  });

  it('genera alias en minúsculas, sin tildes y con guion bajo', () => {
    expect(pipe.transform('vocacion_servicio')).toBe('images/Vocaci%C3%B3n%20Servicio.png');
    expect(pipe.transform('agendar_cita')).toBe('images/agendar%20cita.png');
    expect(pipe.transform('svg_presencial')).toBe('images/svg-presencial.png');
    expect(pipe.transform('alias_desconocido')).toBe('alias_desconocido');
  });

  it('resuelve los alias actualizados de archivos numéricos', () => {
    expect(pipe.transform('odontologia')).toBe('images/007.png');
    expect(pipe.transform('ginecologia')).toBe('images/010.png');
    expect(pipe.transform('nefrologia_2')).toBe('images/022b.png');
    expect(pipe.transform('adulto_mayor')).toBe('images/028.png');
    expect(pipe.transform('consulta_medica')).toBe('images/088.png');
    expect(pipe.transform('comida_manzana')).toBe('images/089.png');
    expect(pipe.transform('feto')).toBe('images/100.png');
    expect(pipe.transform('ecografia')).toBe('images/102.png');
    expect(pipe.transform('bisturi')).toBe('images/103.png');
    expect(pipe.transform('hospita_regional_sur')).toBe('images/727.png');
  });
});
