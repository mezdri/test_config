<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Aplicaciones Cliente" @cerrar="handleCerrar">
      <v-btn class="btn-grabar" color="#526da5" @click="confirmAplicaciones()">
        <span style="color: white;">Guardar Cambios</span>
      </v-btn>
    </CabeceraModal>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        :active.sync="pasos.permisosApps.step"
        absolute
        color="transparent"
      >
        <v-btn
          v-show="pasos.vehiculos.visible"
          @click="handleShowVehiculos"
          color="primary"
          flat
        >
          <span>Vehiculos</span>
          <v-icon>local_shipping</v-icon>
        </v-btn>
        <v-btn
          v-show="pasos.infoGral.visible"
          @click="handleShowInfoGral"
          color="primary"
          flat
        >
          <span>Información General</span>
          <v-icon>info</v-icon>
        </v-btn>
        <v-btn
          v-show="pasos.permisosApps.visible"
          @click="handleShowPermisos"
          color="primary"
          flat
        >
          <span>Permisos Aplicaciones</span>
          <v-icon>apps</v-icon>
        </v-btn>
      </v-bottom-nav>
    </v-card>
    <div class="cardnew">
      <br />
      <div v-show="showInfoGral">
        <TablaInfoGral :cliente="detalleSeleccionado" />
      </div>
      <DetalleForm
        :detalleSeleccionado="detalleSeleccionado"
        :isVerDetalle="true"
        v-if="showVehiculos"
      />
      <div
        v-show="showPermisos"
        style="display: flex; justify-content: center; align-item: center"
      >
        <v-card style="width: 70%">
          <div v-show="muestraBotonRolesEditar">
            <ag-grid-vue
              style="font-family: 'Asap', sans-serif;"
              class="ag-theme-material"
              @selection-changed="onSelectionChanged()"
              :gridOptions="gridOptions"
            ></ag-grid-vue>
          </div>
        </v-card>
      </div>
    </div>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import DetalleForm from '@/pantallas/Conecta/Clientes/DetalleForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';

import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import { BooleanAsNumber } from '@/reusable/Data/dataUtils';
import {
  fetchApps,
  MsResponseData,
} from '@/pantallas/Conecta/Clientes/fetchData';
import { string } from 'yup';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';
import { Dictionary } from 'vuex';
import TablaInfoGral from './TablaInfoGral.vue';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    DetalleForm,
    TablaInfoGral,
    'ag-grid-vue': AgGridVue,
  },
})
export default class VerDetalleModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) detalleSeleccionado: any;

  pasoActivoIndex = 1;
  pasos = {
    vehiculos: {
      accion: 'Crear - Información General',
      visible: false,
      step: 1,
    },
    permisosApps: {
      accion: 'Editar - Asociar a Rol',
      visible: true,
      step: 0,
    },
    infoGral: {
      visible: true,
    },
  };

  gridOptions: GridOptions;
  showVehiculos: boolean = false;
  showPermisos: boolean = false;
  showInfoGral: boolean = true;
  appsSeleccionados: Array<any> = [];
  seleccionoTodos: boolean = false;
  muestraBotonRolesEditar: boolean = true;
  columnDefs: Array<ColDef | ColGroupDef> = [];
  bottonNav: any = '1';
  selectionType: string = 'leaf';
  serverSide: any;
  MsResponseData: MsResponseData = null;
  localeText: any = {};
  gridApi: GridApi;
  columnApi: ColumnApi;
  search: string = '';
  roles: any = [];

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  // fetchApps(path: string, body: any) {
  //   this.loadingService.showLoading();
  //   return fetchApps(path, body)
  //     .catch(error => {
  //       this.$snotify.error(
  //         this.$t('mensajes.mensajesError.consulta', {
  //           entidad: 'las facturaciones',
  //         })
  //       );
  //       return;
  //     })
  //     .finally(() => this.loadingService.hideLoading());
  // }

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Agregar',
        field: 'checked',
        // valueSetter:'checked',
        width: 200,
        minWidth: 200,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Id',
        field: 'id',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        hide: true,
      },
      {
        headerName: 'Aplicación',
        field: 'name',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Descripción',
        field: 'description',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Disponible',
        field: 'active',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 50, //Solución Paginación
      cacheBlockSize: 50, //Solución Paginación //Ordenamiento + Selección
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      suppressCopyRowsToClipboard: true,
      // onSelectionChanged: this.onSelectionChanged,
      // onRowSelected: this.onSelectionRow,
      // isExternalFilterPresent: this.isExternalFilterPresent,
      // doesExternalFilterPass: this.doesExternalFilterPass, FILTROS!!!!
      blockLoadDebounceMillis: 350,
      //   onDragStopped: this.onDragStoppedEvent,
      //   onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {
        medalColumn: { width: 150, columnGroupShow: 'open', filter: false },
        // fecha: {
        //   cellRenderer: this.fechaFilter,
        //   sortable: true,
        //   resizable: true,
        //   filter: false,
        // },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  confirmAplicaciones() {
    //TODO verificar este metodo por que las aplicciones se actualizan antes de precionar el boton de guardado
    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
    this.$store.commit('setApplicationUptaded');
    this.handleCerrar();
  }

  async onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    const self = this;
    this.loadingService.showLoading();
    this.serverSide = {
      getRows(params: any): void {
        params.request.search = self.search;
        params.request.paginationPageSize = self.gridOptions.cacheBlockSize;
        params.request.id = self.detalleSeleccionado.id;
        params.request.apps = self.appsSeleccionados;
        fetchApps('getApps', params.request)
          .then((response: any) => {
            if (response.data.lista.length === 0) {
              params.successCallback([{}], 0);
              self.gridApi.showNoRowsOverlay();
            } else {
              params.successCallback(response.data.lista, response.data.total);
              self.gridApi.hideOverlay();
            }
            //self.gridApi.sizeColumnsToFit();
            self.loadingService.hideLoading();
          })
          .catch((error: any) => {})
          .finally(() => {
            self.gridApi.setDomLayout('autoHeight');
            self.loadingService.hideLoading();
          });
      },
    };
    this.gridApi.setServerSideDatasource(this.serverSide);
  }

  async onSelectionChanged() {
    this.loadingService.showLoading();
    const self = this;
    const params = {
      apps: this.gridApi.getSelectedRows(),
      id: this.detalleSeleccionado.id,
    };
    fetchApps('updateApps', params)
      .catch((error: any) => {})
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  handleShowVehiculos() {
    this.pasos.vehiculos.step = 1;
    this.pasos.permisosApps.step = 0;
    this.showVehiculos = true;
    this.showPermisos = false;
    this.showInfoGral = false;
  }

  handleShowInfoGral() {
    this.pasos.vehiculos.step = 0;
    this.pasos.permisosApps.step = 1;
    this.showInfoGral = true;
    this.showPermisos = false;
    this.showVehiculos = false;
  }

  handleShowPermisos() {
    this.pasos.vehiculos.step = 0;
    this.pasos.permisosApps.step = 1;
    this.showPermisos = true;
    this.showVehiculos = false;
    this.showInfoGral = false;
  }
}
</script>
