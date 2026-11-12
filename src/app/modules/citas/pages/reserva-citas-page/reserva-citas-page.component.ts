import { ImagenPipe } from '../../../../pipes/imagen.pipe';
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
  imports: [ImagenPipe, TabsComponent, AlertComponent,LabelComponent,CardPersonaComponent,CardComponent,CardIpressComponent,BreadcrumbComponent,InputFilterComponent],
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
      imagen: 'hospital_las_palmas',
    },
    {
      codigo: 'HC',
      nombre: 'HOSPITAL CENTRAL FAP',
      imagen: 'hospital_central_fap',
    },
    {
      codigo: 'SG',
      nombre: 'SAN GABINO',
      imagen: 'san_gabino',
    },
  ]);

 // DATOS DE PRUEBA MEDICOS

  readonly medicos = signal([
    {
      codigo: 'MED001',
      nombreCompleto: 'MÉDICO DE PRUEBA UNO',
      cmp: '00001',
      especialidad: 'TRAUMATOLOGÍA GENERAL',
      fotoUrl: null as string | null
    },
    {
      codigo: 'MED002',
      nombreCompleto: 'MÉDICO DE PRUEBA DOS',
      cmp: '00002',
      especialidad: 'TRAUMATOLOGÍA GENERAL',
      fotoUrl: null as string | null
    },
    {
      codigo: 'MED003',
      nombreCompleto: 'MÉDICO DE PRUEBA TRES',
      cmp: '00003',
      especialidad: 'TRAUMATOLOGÍA INFATIL',
      fotoUrl: null as string | null
    },
    {
      codigo: 'MED004',
      nombreCompleto: 'MÉDICO DE PRUEBA CUATRO',
      cmp: '00004',
      especialidad: 'TRAUMATOLOGÍA GENERAL',
      fotoUrl: null as string | null
    }
  ]);
  readonly ipressSeleccionada = signal<{codigo: string; nombre: string;imagen: string;} | null>(null);
  readonly medicoSeleccionado = signal<{ codigo: string; nombreCompleto: string; cmp: string; fotoUrl: string | null } | null>(null);
  // Etapa actual
  readonly pasoActual = signal(1);
  readonly afiliadoSeleccionado = signal<AfiliadoReserva | null>(null);
  readonly busquedaEspecialidad = signal('');
  readonly especialidadSeleccionada = signal<{codigo: string; nombre: string;imagen: string; } | null>(null);

  // Última etapa habilitada
  readonly pasoHabilitado = signal(1);

  seleccionarMedico(medico: {codigo: string; nombreCompleto: string;cmp: string; fotoUrl: string | null;especialidad: string | null;}): void {
    this.medicoSeleccionado.set(medico);
    this.avanzarPaso();
  }

  seleccionarIpress(sede: {codigo: string;nombre: string;imagen: string;}): void {
    this.ipressSeleccionada.set(sede);
    this.avanzarPaso();
  }



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
    Array.from({ length: this.pasoActual() - 1 },(_, index) => String(index + 1))
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

  readonly resumenSelecciones = computed<BreadcrumbItem[]>(() => {
    const paso = this.pasoActual();
    const items: BreadcrumbItem[] = [];
    const afiliado = this.afiliadoSeleccionado();
    const tipo = this.tipoAtencionSeleccionado();
    const sede = this.ipressSeleccionada();
    const especialidad = this.especialidadSeleccionada();

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
    if (paso >= 5 && especialidad) {
      items.push({label: `ESPECIALIDAD: ${especialidad.nombre}`
      });
    }
    if (paso >= 6 && especialidad) {
      items.push({label: `ESPECIALIDAD: ${especialidad.nombre}`
      });
    }

    return items;
  });

  readonly especialidades = signal([
    { codigo: '002', nombre: 'CARDIOLOGÍA', imagen: 'cardiologia' },
    { codigo: '003', nombre: 'CIRUGÍA GENERAL', imagen: 'cirugia_general' },
    { codigo: '004', nombre: 'CIRUGÍA PLÁSTICA', imagen: 'cirugia_plastica' },
    { codigo: '005', nombre: 'UROLOGÍA', imagen: 'urologia' },
    { codigo: '006', nombre: 'OTORRINOLARINGOLOGÍA', imagen: 'otorrinolaringologia' },
    { codigo: '008', nombre: 'OFTALMOLOGÍA', imagen: 'oftalmologia' },
    { codigo: '009', nombre: 'GASTROENTEROLOGÍA', imagen: 'gastroenterologia' },
    { codigo: '011', nombre: 'MEDICINA INTERNA', imagen: 'medicina_interna' },
    { codigo: '012', nombre: 'PSICOLOGÍA', imagen: 'psicologia' },
    { codigo: '013', nombre: 'PSIQUIATRÍA', imagen: 'psiquiatria' },
    { codigo: '014', nombre: 'NEUMOLOGÍA', imagen: 'neumologia' },
    { codigo: '015', nombre: 'NEUROLOGÍA', imagen: 'neurologia' },
    { codigo: '016', nombre: 'CIRUGÍA TÓRAX Y CARDIOVASCULAR', imagen: 'cirugia_torax_y_cardiovascular' },
    { codigo: '017', nombre: 'DERMATOLOGÍA', imagen: 'dermatologia' },
    { codigo: '018', nombre: 'MEDICINA FÍSICA Y REHABILITACIÓN', imagen: 'medicina_fisica_y_rehabilitacion' },
    { codigo: '020', nombre: 'REUMATOLOGÍA', imagen: 'reumatologia' },
    { codigo: '021', nombre: 'TRAUMATOLOGÍA', imagen: 'traumatologia' },
    { codigo: '022', nombre: 'NEFROLOGÍA', imagen: 'nefrologia' },
    { codigo: '024', nombre: 'ENDOCRINOLOGÍA', imagen: 'endocrinologia' },
    { codigo: '046', nombre: 'ONCOLOGÍA', imagen: 'oncologia' },
    { codigo: '048', nombre: 'HEMATOLOGÍA', imagen: 'hematologia' },
    { codigo: '079', nombre: 'LABORATORIO', imagen: 'laboratorio' },
    { codigo: '083', nombre: 'INFECTOLOGÍA', imagen: 'infectologia' }
  ]);


  readonly especialidadesFiltradas = computed(() => {
    const busqueda = this.busquedaEspecialidad().trim() .toLocaleLowerCase('es');

    if (!busqueda) {
      return this.especialidades();
    }

    return this.especialidades().filter(especialidad =>especialidad.nombre.toLocaleLowerCase('es').includes(busqueda));
  });



  seleccionarEspecialidad(especialidad: {codigo: string;nombre: string;imagen: string; }): void {
    this.especialidadSeleccionada.set(especialidad);
    this.avanzarPaso();
  }

}
