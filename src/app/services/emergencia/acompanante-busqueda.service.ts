import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { List_afiliados_by_text } from '../../interfaces/citas/afiliado.interface';
import { AcompananteBusqueda } from '../../interfaces/emergencia/acompanante.interface';
import { AfiliadoService } from '../citas/afiliado.service';
import { AcompananteService } from './acompanante.service';

export interface AcompananteOpcion {
  id: string;
  label: string;
  persona: AcompananteBusqueda | null;
  afiliado: List_afiliados_by_text | null;
}

/**
 * Encapsula la búsqueda combinada de acompañantes: persona ya registrada localmente
 * (AcompananteService) con respaldo al registro de afiliados SIFSA1 (AfiliadoService,
 * del dominio Citas) cuando se busca un titular/familiar FAP sin resultados locales.
 * Existe para que los componentes de Acompañantes no necesiten conocer ni orquestar
 * directamente dos servicios de dominios distintos.
 */
@Injectable({ providedIn: 'root' })
export class AcompananteBusquedaService {
  private readonly acompananteService = inject(AcompananteService);
  private readonly afiliadoService = inject(AfiliadoService);

  buscar(
    termino: string,
    tipoAcompanante: 0 | 1,
    pacienteId: number | null,
  ): Observable<AcompananteOpcion[]> {
    return this.acompananteService.buscar(termino, tipoAcompanante, pacienteId).pipe(
      switchMap(({ data }) => {
        if (data.length > 0 || tipoAcompanante !== 1) {
          return of(data.map((persona) => this.mapear_persona(persona)));
        }

        return this.afiliadoService
          .list_afiliados_by_text(
            termino.substring(0, 10),
            termino.substring(0, 20),
            termino.substring(0, 12),
            termino.substring(0, 50),
          )
          .pipe(
            map(({ data: afiliados }) =>
              afiliados.map((afiliado) => this.mapear_afiliado(afiliado)),
            ),
          );
      }),
      catchError(() => of([] as AcompananteOpcion[])),
    );
  }

  private mapear_persona(persona: AcompananteBusqueda): AcompananteOpcion {
    const nombre = [persona.apellido_paterno, persona.apellido_materno, persona.nombres]
      .filter(Boolean)
      .join(' ');

    return {
      id: `PERSONA-${persona.persona_id}`,
      label: `${persona.numero_documento} — ${nombre}`,
      persona,
      afiliado: null,
    };
  }

  private mapear_afiliado(afiliado: List_afiliados_by_text): AcompananteOpcion {
    return {
      id: `SIFSA1-${afiliado.codigo_afiliado}`,
      label: `${afiliado.historia} — ${afiliado.apellidos} ${afiliado.nombres}`.trim(),
      persona: null,
      afiliado,
    };
  }
}
