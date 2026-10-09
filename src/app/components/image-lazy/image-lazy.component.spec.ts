import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ImageLazyComponent } from './image-lazy.component';
import { ImageService } from '../../services/image.service';

describe('ImageLazyComponent', () => {
  let component: ImageLazyComponent;
  let fixture: ComponentFixture<ImageLazyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageLazyComponent],
      providers: [{ provide: ImageService, useValue: {
        obtener_mi_foto: () => of('https://example.test/photo.png'),
        obtener_foto: () => of(''), obtener_foto_afiliado: () => of(''), obtener_foto_medico: () => of(''),
      } }],
    }).compileComponents();
    fixture = TestBed.createComponent(ImageLazyComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tipo', 'mi-foto');
    fixture.detectChanges();
  });

  it('loads and renders the image from its service', () => {
    component['cargarImagen']();
    fixture.detectChanges();
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(component.cargando()).toBe(false);
    expect(image.src).toBe('https://example.test/photo.png');
  });

  it('renders the fallback after an image error', () => {
    const imageError = vi.fn();
    component.imageError.subscribe(imageError);
    fixture.componentRef.setInput('fallbackSrc', 'assets/fallback.png');
    component.cargarFallback();
    fixture.detectChanges();

    expect(component.error()).toBe(true);
    expect(imageError).toHaveBeenCalled();
    expect((fixture.nativeElement.querySelector('img') as HTMLImageElement).getAttribute('src')).toBe('assets/fallback.png');
  });
});
