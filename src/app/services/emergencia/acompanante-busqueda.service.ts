import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { AcompananteBusqueda } from '../../interfaces/emergencia/acompanante.interface';
import { AcompananteService } from './acompanante.service';

export interface AcompananteOpcion {
  id: string;
  label: string;
  persona: AcompananteBusqueda;
}

/**
 * Encapsula la búsqueda combinada de acompañantes: realiza la consulta al endpoint de
 * acompañantes de sigho_back, el cual busca en personas locales y en afiliados SIFSA1
 * por NSA, DNI o Nombres y Apellidos.
 */
@Injectable({ providedIn: 'root' })
export class AcompananteBusquedaService {
  private readonly acompananteService = inject(AcompananteService);

  buscar(
    termino: string,
    tipoAcompanante: 0 | 1,
    pacienteId: number | null,
  ): Observable<AcompananteOpcion[]> {
    return this.acompananteService.buscar(termino, tipoAcompanante, pacienteId).pipe(
      map(({ data }) => data.map((persona) => this.mapear_persona(persona))),
      catchError(() => of([] as AcompananteOpcion[])),
    );
  }

  private mapear_persona(persona: AcompananteBusqueda): AcompananteOpcion {
    const grado = persona.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = persona.situacion?.toUpperCase()?.trim();
    const sufijoSituacion = grado && situacion === 'RETIRO' ? '(r)' : null;
    const partesGrado = [grado, sufijoSituacion].filter(Boolean).join(' ');

    const apellidos = [persona.apellido_paterno, persona.apellido_materno]
      .map((value) => value?.toUpperCase()?.trim())
      .filter(Boolean)
      .join(' ');

    const nombres = (persona.nombres || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');

    const nombre = [apellidos, nombres].filter(Boolean).join(' ');
    const nombreCompleto = partesGrado ? `${partesGrado} ${nombre}` : nombre;

    const documento = [persona.tipo_documento, persona.numero_documento]
      .filter(Boolean)
      .join(' ');

    const label = documento ? `${nombreCompleto} - ${documento}` : nombreCompleto;

    return {
      id: `PERSONA-${persona.persona_id}`,
      label,
      persona,
    };
  }
}
