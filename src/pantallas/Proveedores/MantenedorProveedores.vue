<template>
  <v-container fluid grid-list-md>
    <v-tabs>
      <v-tab>Proveedores</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right: 10px">
      <v-flex xs4 sm4 md4
        ><v-text-field
          label="Buscar"
          @keyup="gridApi.setQuickFilter(filtro)"
          v-model="filtro"
          @click:clear="gridApi.setQuickFilter('')"
          clearable
          outlined
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm6 :md6="accionCrear.visible"> </v-flex>

      <v-flex xs12 sm6 md2 style="padding-right: 0px">
        <div align="right" style="padding-top: 6px; padding-right: 0px">
          <v-btn
            v-if="accionCrear.visible"
            style="padding-right: 20px"
            color="#ffe800"
            @click="showModalNew = true"
          >
            <v-icon dark left style="color: black">add_circle_outline</v-icon>
            <span style="color: black">Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-divider></v-divider>
    <div class="gridcard rounded-card proveedores">
      <MantenedorGridSinCodigo
        style="width: 100%; height: 400px; font-family: 'Asap' sans-serif"
        class="ag-theme-material"
        :gridOptions="gridOptions"
        :funcionalidadId="funcionalidad"
      >
      </MantenedorGridSinCodigo>
    </div>

    <FormCrearProveedor
      v-if="showModalNew"
      :usados="ruts"
      :usuarioActivo="usuarioActivo"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoCreado="datoNuevo($event)"
    >
    </FormCrearProveedor>

    <FormEditarProveedor
      v-if="showModalEdit"
      :esEdicion="modalEsEdicion"
      :edited="editedItem"
      :usuarioActivo="usuarioActivo"
      v-on:modalAsociacionEmit="moduloModalCallback($event)"
      v-on:datoEditado="datoEditado($event)"
    ></FormEditarProveedor>

    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="'Eliminar Proveedor'"
      :mensaje="`Está seguro de eliminar el proveedor con RUT: ${rutSelected}`"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('Aceptar')"
      :textoBtnNo="$t('Cancelar')"
    ></Confirmation>
  </v-container>
</template>
<script lang="ts">
import FormCrearProveedor from './FormCrearProveedor.vue';
import FormEditarProveedor from './FormEditarProveedor.vue';

import DatePicker from '@/reusable/Form/DatePicker.vue';

import moment from 'moment';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { Accion } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '../../components/Confirmation.vue';
import { eventBus, actionsEvent } from '@/setup';
import HandleErrors from '../../config/handleErrors';
import store from '@/store';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchProveedores } from './fetchProveedores';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FormCrearProveedor,
    FormEditarProveedor,
    DatePicker,
    Confirmation,
  },
})
export default class MantenedorProveedores extends ComponenteBase {
  dialogConfirmacionClose: boolean = false;
  filtro: any;
  ordesList: any[] = [];
  consulta: any = {
    orden: '',
    tecnico: '',
    coordinador: '',
    localidad: '',
    courier: '',
    dateStart: moment()
      .subtract(1, 'month')
      .format('YYYY/MM/DD'),
    dateEnd: moment().format('YYYY/MM/DD'),
  };
  funcionalidad: Funcionalidades = Funcionalidades.TablaMantenedorProveedores;

  ruts: any = [];
  dataTotal: any = [];

  async getProveedor() {
    this.ruts = [];
    let self = this;
    this.loadingService.showLoading();
    return fetchProveedores({}, 'conectaMantenedorProveedores/inicio')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          data.data.data.LISTA.forEach((e: any) => {
            this.ruts.push(e.proveedorrut);
          });
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async deleteProveedor(rut: string) {
    let self = this;
    this.loadingService.showLoading();
    return fetchProveedores(
      { proveedorRut: rut },
      'conectaMantenedorProveedores/eliminar'
    )
      .then((data: any) => {
        self.$snotify.success('Proveedor eliminado con exito', {
          timeout: 3000,
        });
        this.loadingService.hideLoading();
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
        this.loadingService.hideLoading();
      });
  }

  async getCompra(rut: string) {
    let self = this;
    this.loadingService.showLoading();
    return fetchProveedores(
      { proveedorRut: rut },
      'conectaMantenedorProveedores/getCompra'
    ).then((data: any) => {
      //console.log(data.data.data.LISTA);
      if (data.data.CODIGO_RESPUESTA == '1') {
        data.data.data.LISTA.forEach((e: any) => {
          this.ruts.push(e.proveedorrut);
        });
        this.loadingService.hideLoading();
        return data.data.data.LISTA;
      } else {
        this.loadingService.hideLoading();
      }
    });
    /* .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      }) */
  }

  compras: any;
  delete: any;

  async comprobarCompras(rut: string) {
    this.compras = await this.getCompra(rut);
    if (this.compras) {
      console.log(this.compras);
      this.$snotify.error(
        'No se puede eliminar este proveedor ya que tiene compras ',
        { timeout: 3000 }
      );
    } else {
      this.delete = await this.deleteProveedor(rut);
      this.ordesList = await this.getProveedor();
      this.gridApi.setRowData(this.ordesList);
    }
  }

  usuarioActivo: any = {};

  async getUsuario() {
    let self = this;
    let user = JSON.parse(localStorage.getItem('user')).id;

    return fetchProveedores(
      { userId: user },
      'conectaMantenedorProveedores/getUsuario'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.usuarioActivo = data.data.data;
          return null;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      });
  }

  async datoEditado(dato: boolean) {
    if (dato) {
      this.ordesList = await this.getProveedor();
      this.gridApi.setRowData(this.ordesList);
    }
  }

  async datoNuevo(dato: any) {
    if (dato) {
      this.ordesList = await this.getProveedor();
      this.gridApi.setRowData(this.ordesList);
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getProveedor();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  onSelectionChanged(params: any) {}

  showModalNew = false;
  pasoActivoIndex = 1;
  pasoActivoEditar = 1;

  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.accionCrear];

  // Globales
  tabModel: string = 'tab-3';
  dialog: Boolean = false;
  search: string = '';

  gridOptions: GridOptions;

  loadingService = new LoadingService();
  intervalo: any; //Intervalo para el buscador
  chequearPermisosBtnCrear: boolean = true;
  editedIndex: number = -1;

  handleErrors: HandleErrors = new HandleErrors();

  // Controller
  readonly controller: string = 'funcionalidad';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  estadoGrillaVm: EstadoGrillaVm;
  serverSide: any;

  // Interfaces
  editedItem: IFuncionalidad = {};
  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  // Componentes
  //showModalNew: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  dateFormatter(params: any) {
    return moment(params.value).format('YYYY/MM/DD');
  }

  constructor() {
    super();

    this.columnDefs = [
      {
        headerName: 'Rut',
        field: 'proveedorrut',
        resizable: true,
        sortable: true,
        hide: false,
        minWidth: 100,
        width: 120,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Razón Social',
        field: 'proveedorrazon',
        resizable: true,
        sortable: true,
        width: 320,
        minWidth: 320,
        lockPinned: true,
      },
      {
        headerName: 'Dirección',
        field: 'proveedordireccion',
        resizable: true,
        sortable: true,
        width: 320,
        minWidth: 320,
        lockPinned: true,
      },
      {
        headerName: 'País',
        field: 'proveedorpais',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Teléfono',
        field: 'proveedortel',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Contacto',
        field: 'proveedorcontacto',
        sortable: true,
        resizable: true,
        width: 200,
        minWidth: 200,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Email',
        field: 'proveedoremail',
        width: 205,
        minWidth: 200,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Condición',
        field: 'proveedorcondicion',
        resizable: true,
        width: 120,
        minWidth: 120,
        lockPinned: true,
        sortable: true,
      },
    ];

    this.gridOptions = {
      pagination: true,
      paginationPageSize: 6, //Solución Paginación
      //cacheBlockSize: 50, //Solución Paginación
      //paginationAutoPageSize: false,
      rowModelType: 'normal',
      columnDefs: this.columnDefs,
      //rowModelType: 'serverSide',
      serverSideDatasource: this.serverSide,
      rowSelection: 'single',
      columnTypes: {
        fecha: {
          //cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
      onGridReady: this.handleGridReady,
      onModelUpdated: this.onModelUpdated,
      onSelectionChanged: this.onSelectionChanged,

      processCellForClipboard: ({ value }) => {
        return value instanceof moment
          ? this.formatFecha(value as moment.Moment)
          : value;
      },
      onGridSizeChanged: event => {
        //event.api.sizeColumnsToFit();
      },
    };
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  mounted() {
    eventBus.changeTitlePage('Módulos');
    this.getUsuario();
  }

  created() {
    this.initialize();
  }

  onFilterTextBoxChanged() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.search.length >= 2) {
        self.gridApi.onFilterChanged();
      } else if (self.search.length === 0) {
        self.gridApi.setServerSideDatasource(self.serverSide);
      }
      clearInterval(self.intervalo);
    }, 500);
  }
  rutSelected: string = '';
  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.TablaMantenedorProveedores) {
        if (data.action === Accion.Eliminar) {
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.rutSelected = data.cellRendererParams.data.proveedorrut;
            this.dialogConfirmacionClose = true;
          }
        } else if (data.action === Accion.Editar) {
          this.editedItem = null;
          // Editar - Ver Detalle
          this.modalEsEdicion = data.action == Accion.Editar;
          this.editedIndex = data.id;

          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.showModalEdit = true;
            this.editedItem = data.cellRendererParams.data.proveedorrut;
          }
        }
      }
    });
  }

  beforeDestroy() {}

  moduloModalCallback(val: boolean) {
    this.showModalNew = val;
    this.showModalEdit = val;
    //this.obtenerMayor()+1;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.comprobarCompras(this.rutSelected);
    }
  }
}
</script>

<style>
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.proveedores
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-header.ag-pivot-off
  > div.ag-pinned-left-header {
  display: none;
}
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.proveedores
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-viewport.ag-row-no-animation.ag-layout-auto-height
  > div.ag-pinned-left-cols-container {
  display: none;
}
#app
  > div.application--wrap
  > div:nth-child(2)
  > main
  > div
  > div
  > div.gridcard.rounded-card.proveedores
  > div
  > div
  > div
  > div
  > div.ag-root-wrapper-body.ag-layout-auto-height
  > div.ag-root.ag-unselectable.ag-layout-auto-height
  > div.ag-body-horizontal-scroll
  > div.ag-horizontal-left-spacer {
  display: none;
}
</style>
