import { Component, computed, signal } from '@angular/core';
import { TabItem, TabsComponent } from '../../../../components/tabs/tabs.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { LabelComponent } from '../../../../components/label/label.component';
import { AfiliadoReserva } from '../../../../interfaces/citas/afiliado.interface';
import { CardPersonaComponent } from '../../../../components/card-persona/card-persona.component';
import { CardComponent } from '../../../../components/card/card.component';
import { CardIpressComponent } from '../../../../components/card-ipress/card-ipress.component';

@Component({
  imports: [TabsComponent, AlertComponent, LabelComponent,LabelComponent,CardPersonaComponent,CardComponent,CardIpressComponent],
  selector: 'app-reserva-citas-page',
  styleUrl: './reserva-citas-page.component.scss',
  templateUrl: './reserva-citas-page.component.html',
})
export class ReservaCitasPageComponent {


  readonly afiliados = signal<AfiliadoReserva[]>([
    // datos temporales de prueba
    {
      codigo: 'AF001',
      nombreCompleto: 'AFILIADO DE PRUEBA UNO',
      dni: '00000001',
      fotoUrl: null,
    },
    {
      codigo: 'AF002',
      nombreCompleto: 'AFILIADO DE PRUEBA DOS',
      dni: '00000002',
      fotoUrl: null,
    },
  ]);

  readonly ipress = signal([
    {
      codigo: 'LP',
      nombre: 'HOSPITAL LAS PALMAS',
      imagen: 'assets/images/823.png',
    },
    {
      codigo: 'HC',
      nombre: 'HOSPITAL CENTRAL FAP',
      imagen: 'assets/images/721.png',
    },
    {
      codigo: 'SG',
      nombre: 'SAN GABINO',
      imagen: 'assets/images/828.png',
    },
  ]);

  readonly ipressSeleccionada = signal<{
    codigo: string;
    nombre: string;
    imagen: string;
  } | null>(null);

  seleccionarIpress(sede: {
    codigo: string;
    nombre: string;
    imagen: string;
  }): void {
    this.ipressSeleccionada.set(sede);
    this.avanzarPaso();
  }

  // Etapa actual
  readonly pasoActual = signal(1);
  readonly afiliadoSeleccionado = signal<AfiliadoReserva | null>(null);

  // Última etapa habilitada
  readonly pasoHabilitado = signal(1);

  // Etapas del proceso
  readonly pasos = computed<TabItem[]>(() => {
    const habilitado = this.pasoHabilitado();

    return [
      { id: '1', label: 'Afiliado' },
      { id: '2', label: 'Tipo de atención' },
      { id: '3', label: 'IPRESS' },
      { id: '4', label: 'Especialidad' },
      { id: '5', label: 'Médico' },
      { id: '6', label: 'Fecha' },
      { id: '7', label: 'Impresión' },
    ].map((paso, index) => ({...paso,disabled: index + 1 > habilitado,}));
  });

  // Pasos completados
  readonly pasosCompletados = computed(() =>
    Array.from(
      { length: this.pasoHabilitado() - 1 },
      (_, index) => String(index + 1)
    )
  );

  // Cambiar de etapa
  seleccionarPaso(id: string): void {
    const paso = Number(id);

    if (
      !Number.isInteger(paso) || paso < 1 ||paso > this.pasoHabilitado()
    ) {
      return;
    }

    this.pasoActual.set(paso);
  }

  // Se utilizará cuando se complete cada etapa
  avanzarPaso(): void {
    const siguiente = this.pasoActual() + 1;

    if (siguiente > 7) {
      return;
    }

    this.pasoHabilitado.update(actual =>Math.max(actual, siguiente)
    );

    this.pasoActual.set(siguiente);
  }


  seleccionarAfiliado(afiliado: AfiliadoReserva): void {
    this.afiliadoSeleccionado.set(afiliado);
    this.avanzarPaso();
  }

  readonly tipoAtencionSeleccionado =
  signal<'PRESENCIAL' | 'VIRTUAL' | null>(null);

  seleccionarTipoAtencion(tipo: 'PRESENCIAL' | 'VIRTUAL'): void {
    this.tipoAtencionSeleccionado.set(tipo);
    this.avanzarPaso();
  }
}
