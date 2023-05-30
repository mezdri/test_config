<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Configurar Notificación</StepTitle>
          <v-divider></v-divider>
          <br />
          <div>
            <v-layout row wrap>
              <v-flex sm12 md6>
                <v-select
                  :items="formFields.listaDist.items"
                  item-text="nombre"
                  item-value="id"
                  v-model="formFields.listaDist.value"
                  v-validate="'required'"
                />
              </v-flex>
              <v-flex sm12 md6>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiLista &&
                      gridApiLista.setQuickFilter.bind(gridApiLista)
                  "
                  prepend="person"
                />
              </v-flex>
            </v-layout>
          </div>
          <v-flex sm12 md12>
            <div align="left">
              <MantenedorGridVerDetalle
                v-if="disabled"
                :grid-options="gridOptionsLista"
                :row-data="distribucion"
              />
              <AsociacionGrid
                v-else
                :grid-options="gridOptionsLista"
                :row-data="distribucion"
                :esEditar="!(accion === 2) ? false : true"
              />
            </div>
          </v-flex>
          <br />
          <FormFieldsContainer titulo="Medio de Notificación" hidden="true">
            <v-flex xs12 sm12 md3>
              <v-checkbox
                label="Plataforma GPS"
                v-model="formFields.medioNotificacion.value"
                :value="1"
                :disabled="disabled"
              ></v-checkbox>
            </v-flex>
            <v-flex xs12 sm12 md3>
              <v-checkbox
                label="Navegador"
                :value="2"
                v-model="formFields.medioNotificacion.value"
                :disabled="disabled"
              ></v-checkbox>
            </v-flex>
            <v-flex xs12 sm12 md3>
              <v-checkbox
                label="Email"
                :value="3"
                v-model="formFields.medioNotificacion.value"
                :disabled="disabled"
              ></v-checkbox>
            </v-flex>
          </FormFieldsContainer>
          <br />
          <v-layout row wrap>
            <div align="left">
              <v-flex md12>
                <h2 class="h2_title">Calendario</h2>
              </v-flex>
            </div>
          </v-layout>
          <v-divider></v-divider>
          <CabeceraTabla v-show="!disabled">
            <template v-slot:derecha>
              <AgregarButton @click="handleAgregarClick()" />
            </template>
          </CabeceraTabla>
          <div align="left">
            <MantenedorGridVerDetalle
              v-if="disabled"
              :grid-options="gridOptionsCalendario"
              :row-data="calendarios"
            />
            <AsociacionGrid
              v-else
              :grid-options="gridOptionsCalendario"
              :row-data="calendarios"
              :esEditar="!(accion === 2) ? false : true"
              :headerCheckbox="false"
            />
          </div>

          <AgregarCalendarioModal
            :show="isModalCrearActivo"
            @cerrar="handleCierreModalCrud"
            @cerrarBtnGuardar="handleCierreModalBtnGuardar"
          />
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { debounce } from 'lodash';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import TextField from '@/reusable/Form/TextField.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  FormState as BaseFormState,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import {
  GridReadyEvent,
  GridApi,
  GridOptions,
  GetQuickFilterTextParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import {
  ListaDistribucionPlanMantenimiento,
  ContactosPlanMantenimiento,
  CalendarioPlanMantenimiento,
  DistribucionPlanMantenimiento,
  PlanMantenimientoDetalle,
} from './Data/PlanMantenimiento';
import { fetchListasDistribucion } from './Data/fetchListaDistribucion';
import { fetchContactos } from './Data/fetchContacto';
import { fetchCalendarios } from './Data/fetchCalendario';
import { OperacionesCrud } from '../../reusable/Mantenedor/mantenedorUtils';
import AgregarCalendarioModal from './AgregarCalendarioModal.vue';
import { intersectionBy } from 'lodash';
import { IInformeProgramadoBackend } from '@/pantallas/ProgramacionInforme/fetchTipoInformeById';
import {
  fetchListDistrContactosUsuarios,
  ListaDistribucion,
  Contacto,
  Usuario,
  ListDistrContactosUsuarios,
} from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';

@Component({
  components: {
    DatePicker,
    TextField,
    FormFieldsContainer,
    StepTitle,
    BuscadorOperacionCrud,
    AgregarButton,
    CabeceraTabla,
    MantenedorGrid,
    AsociacionGrid,
    AgregarCalendarioModal,
    MantenedorGridVerDetalle,
  },
})
export default class ConfigurarNotificacion extends Vue {
  @Prop({ default: false }) disabled: boolean;
  @Prop() distribucionSeleccionada: DistribucionPlanMantenimiento[];
  @Prop() calendarioSeleccionado: CalendarioPlanMantenimiento[];
  @Prop() planMantenimientoSeleccionado: PlanMantenimientoDetalle;
  @Prop()
  informeProgramadoSeleccionado: IInformeProgramadoBackend;
  @Prop({ default: 1 }) accion: number;

  formFields: FormFieldDefMap = {
    listaDist: {
      label: '',
      id: 'listaDistribucion',
      value: 0,
      items: [],
    },
    medioNotificacion: {
      label: '',
      id: 'medioNotificacion',
      value: [],
    },
  };

  gridApiLista: GridApi = null;
  gridApiCalendario: GridApi = null;
  listasDistribucion: ListaDistribucion[] = [];
  listaContactos: Contacto[] = [];
  listaUsuarios: Usuario[] = [];
  listados: ListDistrContactosUsuarios = null;

  listasDistribucionSeleccionados: ListaDistribucion[] = [];
  listaContactosSeleccionados: Contacto[] = [];
  calendarios: CalendarioPlanMantenimiento[] = [];
  modalCrudActivo: OperacionesCrud = null;
  distribucion: DistribucionPlanMantenimiento[] = [];

  /* template */

  /*misc*/

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  readonly gridOptionsLista: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
        width: 200,
        minWidth: 200,
        filter: true,
      },
      {
        headerName: 'Correo Electrónico',
        field: 'email',
        width: 200,
        minWidth: 200,
        filter: true,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReadyLista,
    onSelectionChanged: this.onDistribucionChange,
    getRowNodeId: this.getRowNodeId,
    isExternalFilterPresent: this.isExternalFilterPresent,
    doesExternalFilterPass: this.doesExternalFilterPass,
  };
  tipo: string = 'Lista de Distribución';
  isExternalFilterPresent() {
    return this.tipo != '';
  }

  doesExternalFilterPass(node: any) {
    return node.data.tipo == this.tipo;
  }

  readonly gridOptionsCalendario: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre Calendario',
        field: 'nombreCalendario',
        suppressMovable: true,
        lockVisible: true,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Frecuencia',
        field: 'frecuencia',
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Fecha Inicio',
        field: 'fechaInicio',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
        comparator: undefined,
        width: 200,
        minWidth: 200,
      },
      {
        headerName: 'Fecha Fin',
        field: 'fechaFin',
        valueFormatter: this.fechaValueFormatter,
        getQuickFilterText: this.fechaQuickFilterGetter,
        comparator: undefined,
        width: 200,
        minWidth: 200,
      },
    ],
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReadyCalendario,
    onSelectionChanged: this.onCalendarioChange,
  };

  formatFecha(fecha: moment.Moment) {
    if (!fecha) {
      return '';
    }
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  async handleGridReadyLista(event: GridReadyEvent) {
    this.gridApiLista = event.api;
    // this.listasDistribucion = (await this.fetchListaDistribucion()) || [];
    // this.listaContactos = (await this.fetchContactos()) || [];
    this.listados = (await this.fetchListados()) || null;
    if (this.listados) {
      this.listasDistribucion = this.listados.listaDistribucion;
      this.listaContactos = this.listados.contactos;
      this.listaUsuarios = this.listados.usuarios;
    }

    const makeDistribucionConGridId = (prependTexto: string) => (
      x: Contacto | ListaDistribucion | Usuario
    ): DistribucionPlanMantenimiento => ({
      ...x,
      agGridId: `${prependTexto}-${x.id}}`,
    });
    this.distribucion = [
      ...this.listasDistribucion.map(makeDistribucionConGridId('Lista')),
      ...this.listaContactos.map(makeDistribucionConGridId('Contacto')),
      ...this.listaUsuarios.map(makeDistribucionConGridId('Usuario')),
    ];

    this.marcarDistribucionSeleccionada();
    this.tipo = 'Lista de Distribución';
  }

  getRowNodeId(distribucion: DistribucionPlanMantenimiento) {
    if (!distribucion) {
      return;
    }
    return distribucion.agGridId;
  }

  async handleGridReadyCalendario(event: GridReadyEvent) {
    this.gridApiCalendario = event.api;
    this.calendarios = (await this.fetchCalendario()) || [];

    this.marcarCalendariosSeleccionados();
  }

  async marcarDistribucionSeleccionada() {
    if (!this.distribucionSeleccionada) {
      return;
    }

    // this.distribucion = intersectionBy(
    //   [
    //     ...this.distribucionSeleccionada.map(listasSeleccionada => {
    //       const distribuciones = this.distribucion.find(
    //         x =>
    //           x.id === listasSeleccionada.id &&
    //           x.tipo === listasSeleccionada.tipo
    //       );
    //       return {
    //         ...listasSeleccionada,
    //         nombre: distribuciones
    //           ? distribuciones.nombre
    //           : listasSeleccionada.nombre,
    //       };
    //     }),
    //     ...this.distribucion,
    //   ],
    //   (distribucion: DistribucionPlanMantenimiento) => distribucion.id
    // );

    // Permitir makeDistribucionConGridId ag-grid tiempo de renderizar el nuevo conjunto de filas
    setTimeout(() => {
      this.gridApiLista.forEachNode(nodo => {
        const seleccionada = this.distribucionSeleccionada.find(
          x => x.id === nodo.data.id && x.tipo === nodo.data.tipo
        );

        nodo.setSelected(seleccionada ? true : false);
      });

      if (this.disabled) {
        this.distribucion = this.gridApiLista.getSelectedRows();
      }
    });
  }

  marcarCalendariosSeleccionados() {
    if (!this.calendarioSeleccionado) {
      return;
    }

    this.calendarios = intersectionBy(
      [
        ...this.calendarioSeleccionado.map(listasSeleccionada => {
          const calendario = this.calendarios.find(
            x => x.id === listasSeleccionada.id
          );
          return {
            ...listasSeleccionada,
            nombreCalendario: calendario
              ? calendario.nombreCalendario
              : listasSeleccionada.nombreCalendario,
            frecuencia: calendario
              ? calendario.frecuencia
              : listasSeleccionada.frecuencia,
            fechaInicio: calendario
              ? calendario.fechaInicio
              : listasSeleccionada.fechaInicio,
            fechaFin: calendario
              ? calendario.fechaFin
              : listasSeleccionada.fechaFin,
          };
        }),
        ...this.calendarios,
      ],
      (calendario: CalendarioPlanMantenimiento) => calendario.id
    );

    // Permitir makeDistribucionConGridId ag-grid tiempo de renderizar el nuevo conjunto de filas
    setTimeout(() => {
      this.gridApiCalendario.forEachNode(nodo => {
        const seleccionada = this.calendarioSeleccionado.find(
          x => x.id === nodo.data.id
        );

        nodo.setSelected(seleccionada ? true : false);
      });

      if (this.disabled) {
        this.calendarios = this.gridApiCalendario.getSelectedRows();
      }
    });
  }

  @Watch('planMantenimientoSeleccionado')
  handleOpcionesSeleccionadas() {
    if (!this.planMantenimientoSeleccionado) {
      return;
    }

    let mediosNotificacionSeleccionados: number[] = [];

    if (this.planMantenimientoSeleccionado.notificaGps) {
      mediosNotificacionSeleccionados.push(1);
    }
    if (this.planMantenimientoSeleccionado.notificaBrowser) {
      mediosNotificacionSeleccionados.push(2);
    }
    if (this.planMantenimientoSeleccionado.notificaEmail) {
      mediosNotificacionSeleccionados.push(3);
    }

    this.formFields.medioNotificacion.value = mediosNotificacionSeleccionados;
  }

  @Watch('informeProgramadoSeleccionado', { deep: true, immediate: true })
  handleOpcionesSeleccionadasInforme() {
    if (!this.informeProgramadoSeleccionado) {
      return;
    }

    let mediosNotificacionSeleccionados: number[] = [];

    if (this.informeProgramadoSeleccionado.notificaGps) {
      mediosNotificacionSeleccionados.push(1);
    }
    if (this.informeProgramadoSeleccionado.notificaBrowser) {
      mediosNotificacionSeleccionados.push(2);
    }
    if (this.informeProgramadoSeleccionado.notificaEmail) {
      mediosNotificacionSeleccionados.push(3);
    }

    this.formFields.medioNotificacion.value = mediosNotificacionSeleccionados;
  }

  @Watch('formFields.listaDist.value')
  handleCambioLista() {
    if (!this.gridApiLista) {
      return;
    }

    if (this.formFields.listaDist.value === 1) {
      this.tipo = 'Contacto';
    } else if (this.formFields.listaDist.value === 0) {
      this.tipo = 'Lista de Distribución';
    } else {
      this.tipo = 'Usuario';
    }
    this.gridApiLista.onFilterChanged();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          listaDist: this.formFields.listaDist.value,
          medioNotificacion: this.formFields.medioNotificacion.value,
        },
      },
      this
    );
  }

  makeListaDistribucionNotificacion(
    rowData: DistribucionPlanMantenimiento
  ): DistribucionPlanMantenimiento {
    return {
      id: rowData.id,
      agGridId: rowData.agGridId,
      nombre: rowData.nombre,
      tipo: rowData.tipo,
    };
  }

  onDistribucionChange() {
    const distribucion: DistribucionPlanMantenimiento[] = this.gridApiLista
      .getSelectedNodes()
      .map(node => this.makeListaDistribucionNotificacion(node.data));

    this.$emit('distribucionChange', distribucion);
  }

  onSelectionChanged() {
    this.onDistribucionChange();
  }

  makeListaCalendario(
    rowData: CalendarioPlanMantenimiento
  ): CalendarioPlanMantenimiento {
    return {
      id: rowData.id,
      nombreCalendario: rowData.nombreCalendario,
      frecuencia: rowData.frecuencia,
      fechaInicio: rowData.fechaInicio,
      fechaFin: rowData.fechaFin,
    };
  }

  onCalendarioChange() {
    const calendario: CalendarioPlanMantenimiento[] = this.gridApiCalendario
      .getSelectedNodes()
      .map(node => this.makeListaCalendario(node.data));
    this.$emit('calendarioChange', calendario);
  }

  onSelectionChangedCalendario() {
    this.onCalendarioChange();
  }

  handleAgregarClick() {
    this.modalCrudActivo = OperacionesCrud.crear;
  }

  handleCierreModalCrud() {
    this.modalCrudActivo = null;
  }

  handleCierreModalBtnGuardar() {
    this.modalCrudActivo = null;
    this.recargarCalendarios();
  }

  async recargarCalendarios() {
    this.calendarios = (await this.fetchCalendario()) || [];
    this.gridApiCalendario.setRowData(this.calendarios);
  }

  fetchListaDistribucion() {
    this.loadingService.showLoading();
    return fetchListasDistribucion()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Listas de Distribución.',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchCalendario() {
    this.loadingService.showLoading();
    return fetchCalendarios()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los Calendarios',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchContactos() {
    this.loadingService.showLoading();
    return fetchContactos()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los Contactos',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  fetchListados() {
    this.loadingService.showLoading();
    return fetchListDistrContactosUsuarios()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los listados de notificaciones',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  mounted() {
    this.formFields.listaDist.items = [
      { id: 0, nombre: 'Lista de Distribución' },
      {
        id: 1,
        nombre: 'Contacto',
      },
      {
        id: 2,
        nombre: 'Usuario',
      },
    ];

    this.handleCambioLista();
    this.handleOpcionesSeleccionadas();
  }

  //getters
  get isModalCrearActivo() {
    return this.modalCrudActivo === OperacionesCrud.crear;
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
