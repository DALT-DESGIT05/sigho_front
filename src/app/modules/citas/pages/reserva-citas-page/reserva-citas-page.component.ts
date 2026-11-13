import { Component, computed, signal } from '@angular/core';
import { TabItem, TabsComponent } from '../../../../components/tabs/tabs.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { LabelComponent } from '../../../../components/label/label.component';
import { AfiliadoReserva } from '../../../../interfaces/citas/afiliado.interface';
import { CardPersonaComponent } from '../../../../components/card-persona/card-persona.component';
import { CardComponent } from '../../../../components/card/card.component';
import { CardIpressComponent } from '../../../../components/card-ipress/card-ipress.component';
import { BreadcrumbComponent,BreadcrumbItem } from '../../../../components/breadcrumb/breadcrumb.component';
import { InputFilterComponent } from '../../../../components/input-filter/input-filter.component';

@Component({
  imports: [TabsComponent, AlertComponent,LabelComponent,CardPersonaComponent,CardComponent,CardIpressComponent,BreadcrumbComponent,InputFilterComponent],
  selector: 'app-reserva-citas-page',
  styleUrl: './reserva-citas-page.component.scss',
  templateUrl: './reserva-citas-page.component.html',
})
export class ReservaCitasPageComponent {


  readonly afiliados = signal<AfiliadoReserva[]>([
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

  readonly pasoActual = signal(1);
  readonly afiliadoSeleccionado = signal<AfiliadoReserva | null>(null);
  readonly busquedaEspecialidad = signal('');

  readonly pasoHabilitado = signal(1);

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

  readonly pasosCompletados = computed(() =>
    Array.from(
      { length: this.pasoActual() - 1 },
      (_, index) => String(index + 1)
    )
  );

  seleccionarPaso(id: string): void {
    const paso = Number(id);

    if (
      !Number.isInteger(paso) || paso < 1 ||paso > this.pasoHabilitado()
    ) {
      return;
    }

    this.pasoActual.set(paso);
  }

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

  readonly resumenSelecciones = computed<BreadcrumbItem[]>(() => {
    const paso = this.pasoActual();
    const items: BreadcrumbItem[] = [];
    const afiliado = this.afiliadoSeleccionado();
    const tipo = this.tipoAtencionSeleccionado();
    const sede = this.ipressSeleccionada();

    if (paso >= 2 && afiliado) {
      items.push({label: `AFILIADO: ${afiliado.nombreCompleto}`});
    }

    if (paso >= 3 && tipo) {
      items.push({label: `TIPO DE ATENCIÓN: ${tipo === 'PRESENCIAL'? 'CONSULTA PRESENCIAL': 'CONSULTA VIRTUAL'}`
      });
    }

    if (paso >= 4 && sede) {
      items.push({label: `IPRESS: ${sede.nombre}`
      });
    }

    return items;
  });

  readonly especialidades = signal([
    { codigo: '002', nombre: 'CARDIOLOGÍA', imagen: 'assets/svg/002.png' },
    { codigo: '003', nombre: 'CIRUGÍA GENERAL', imagen: 'assets/svg/003.png' },
    { codigo: '004', nombre: 'CIRUGÍA PLÁSTICA', imagen: 'assets/svg/004.png' },
    { codigo: '005', nombre: 'UROLOGÍA', imagen: 'assets/svg/005.png' },
    { codigo: '006', nombre: 'OTORRINOLARINGOLOGÍA', imagen: 'assets/svg/006.png' },
    { codigo: '008', nombre: 'OFTALMOLOGÍA', imagen: 'assets/svg/008.png' },
    { codigo: '009', nombre: 'GASTROENTEROLOGÍA', imagen: 'assets/svg/009.png' },
    { codigo: '011', nombre: 'MEDICINA INTERNA', imagen: 'assets/svg/011.png' },
    { codigo: '012', nombre: 'PSICOLOGÍA', imagen: 'assets/svg/012.png' },
    { codigo: '013', nombre: 'PSIQUIATRÍA', imagen: 'assets/svg/013.png' },
    { codigo: '014', nombre: 'NEUMOLOGÍA', imagen: 'assets/svg/014.png' },
    { codigo: '015', nombre: 'NEUROLOGÍA', imagen: 'assets/svg/015.png' },
    { codigo: '016', nombre: 'CIRUGÍA TÓRAX Y CARDIOVASCULAR', imagen: 'assets/svg/016.png' },
    { codigo: '017', nombre: 'DERMATOLOGÍA', imagen: 'assets/svg/017.png' },
    { codigo: '018', nombre: 'MEDICINA FÍSICA Y REHABILITACIÓN', imagen: 'assets/svg/018.png' },
    { codigo: '020', nombre: 'REUMATOLOGÍA', imagen: 'assets/svg/020.png' },
    { codigo: '021', nombre: 'TRAUMATOLOGÍA', imagen: 'assets/svg/021.png' },
    { codigo: '022', nombre: 'NEFROLOGÍA', imagen: 'assets/svg/022.png' },
    { codigo: '024', nombre: 'ENDOCRINOLOGÍA', imagen: 'assets/svg/024.png' },
    { codigo: '046', nombre: 'ONCOLOGÍA', imagen: 'assets/svg/046.png' },
    { codigo: '048', nombre: 'HEMATOLOGÍA', imagen: 'assets/svg/048.png' },
    { codigo: '079', nombre: 'LABORATORIO', imagen: 'assets/svg/079.png' },
    { codigo: '083', nombre: 'INFECTOLOGÍA', imagen: 'assets/svg/083.png' }
  ]);


  readonly especialidadesFiltradas = computed(() => {
    const busqueda = this.busquedaEspecialidad().trim() .toLocaleLowerCase('es');

    if (!busqueda) {
      return this.especialidades();
    }

    return this.especialidades().filter(especialidad =>especialidad.nombre.toLocaleLowerCase('es').includes(busqueda));
  });

  readonly especialidadSeleccionada = signal<{
    codigo: string;
    nombre: string;
    imagen: string;
  } | null>(null);

  seleccionarEspecialidad(especialidad: {
    codigo: string;
    nombre: string;
    imagen: string;
  }): void {
    this.especialidadSeleccionada.set(especialidad);
    this.avanzarPaso();
  }

}
