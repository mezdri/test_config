<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab :href="`#tab-3`">Flotas Compartidas</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:10px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap
      v-show="muestraBarraBotones"
      class="animated fadeIn fast"
    >
      <div data-permiso="Editar">
        <v-flex md3>
          <v-btn
            data-permiso="Editar"
            flat
            small
            class="btn-barra"
            @click="dejarRecibirInformacion()"
          >
            <v-icon>delete</v-icon>&nbsp;&nbsp;Dejar de Recibir Información
          </v-btn>
        </v-flex>
      </div>
    </v-layout>
    <v-divider></v-divider>

    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>

    <app-confirmacion
      :show="dialogEliminar"
      :titulo="_titulo"
      :mensaje="_mensaje"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      textoBtnSi="Aceptar"
      textoBtnNo="Cancelar"
    ></app-confirmacion>

    <app-vehiculos-compartidos
      :show="showModalVehiculos"
      :flota="editedItem"
      v-on:modalAsociacionEmit="flotaModalCallback($event)"
    ></app-vehiculos-compartidos>
  </v-container>
</template>
<script lang="ts">
import config from '@/config/index';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, Accion } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { FlotaInterface } from '@/interfaces/Flota';
import { actionsEvent } from '@/setup';
import { EstadoEntidad } from '@/config/enums';
import VehiculosCompartidos from '@/components/plataforma/VehiculosCompartidos.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import store from '@/store';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  RowNode,
} from 'ag-grid-community';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-vehiculos-compartidos': VehiculosCompartidos,
  },
})
export default class FlotasCompartidas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.FlotasCompartidas;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly controller: string = 'flotaCompartida';
  tabModel: string = 'tab-3';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  serverSide: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  showModalVehiculos: boolean = false;
  muestraBarraBotones: boolean = false;

  _titulo: string = '';
  _mensaje: string = '';
  dialogEliminar: boolean = false;
  deleteItem: any = {};

  sideBar: any = config.agGridDefaultConfig;
  $snotify: any;
  search: string = '';
  editedIndex: number = -1;
  editedItem: FlotaInterface = {};
  defaultItem: FlotaInterface = {};

  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculos: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  clienteId: number = config.getClienteSesion();

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        filter: false,
        resizable: false,
        sortable: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Flota Origen',
        field: 'flota.nombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Vehículos',
        field: 'vehiculosFlota.length',
        cellRenderer: this.createButtonCell,
        resizable: true,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Empresa',
        field: 'empresa', //"clienteCompartidoNombre",
        resizable: true,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Fecha Compartido',
        field: 'fechaInicioAsociacion',
        cellRenderer: this.fechaFilter,
        resizable: true,
        sortable: true,
        minWidth: 80,
        filter: false,
      },
      {
        headerName: 'Compartida Por',
        field: 'usuarioComparteNombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Fecha Aceptada',
        field: 'fechaAceptacion',
        cellRenderer: this.fechaFilter,
        resizable: true,
        sortable: true,
        minWidth: 80,
        filter: false,
      },
      {
        headerName: 'Aceptada por',
        field: 'usuarioAceptaNombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
      },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        width: 120,
        pinned: 'right',
        suppressMenu: true,
        filter: false,
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 10, //Solución Paginación
      cacheBlockSize: 10, //Solución Paginación
      paginationAutoPageSize: true,
      suppressRowClickSelection: true,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      onSelectionChanged: this.onSelectionChanged,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      blockLoadDebounceMillis: 100,
      suppressCsvExport: true,
      suppressExcelExport: true,
    };

    this.initialize();
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  onFilterTextBoxChanged() {
    if (this.search.length >= 2) {
      this.gridApi.onFilterChanged();
    } else if (this.search.length === 0) {
      this.gridApi.setServerSideDatasource(this.serverSide);
    }
  }

  onGridReady(params: GridReadyEvent) {
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        getRows(params: any): void {
          params.request.search = self.search;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación

          self.axiosVehiculos
            .http(`${self.controller}/${self.clienteId}/grid`, {
              params: params.request,
            })
            .then(flotas => {
              if (flotas.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(flotas.data.data, flotas.data.lastRow);
              }
            })
            .catch(err => {
              params.failCallback();
            });
        },
      };

      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  closeModal(val: Boolean) {}

  createButtonCell(params: any) {
    let cant = params.data.vehiculosFlota.filter(
      (x: any) => x.fechaFinAsociacion == null
    );
    let eButton = document.createElement('a');
    eButton.setAttribute('title', 'Ver Vehículos');
    eButton.style.textDecoration = 'underline';
    eButton.innerHTML = cant.length;

    eButton.addEventListener('click', () => {
      this.visualizarVehiculos(params.data.flotaId, cant.length);
    });

    return eButton;
  }

  visualizarVehiculos(idFlota: number, cantidad: number) {
    if (cantidad > 0) {
      this.editedItem.id = idFlota;
      this.showModalVehiculos = true;
    } else {
      this.$snotify.info('Flota seleccionada no posee vehículos.');
    }
  }

  flotaModalCallback(val: boolean) {
    this.showModalVehiculos = false;
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
  }

  dejarRecibirInformacion(): void {
    let items = this.gridApi.getSelectedNodes();
    if (items.length > 1) {
      this._titulo = 'Dejar de recibir información';
      this._mensaje =
        '¿Está seguro que desea dejar de recibir información de las flotas seleccionadas de forma definitiva?';
      this.dialogEliminar = true;
    } else {
      this._titulo =
        'Dejar de recibir información de flota: ' + items[0].data.flota.nombre;
      this._mensaje =
        '¿Está seguro que desea dejar de recibir información de la flota ' +
        items[0].data.flota.nombre +
        ' compartida por ' +
        items[0].data.usuarioComparteNombre +
        ' de forma definitiva?';
      this.dialogEliminar = true;
    }
  }

  deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;

    if (val) {
      let items = this.gridApi.getSelectedNodes();
      let model: any = [];

      if (items.length === 0) {
        model.push({
          Id: this.deleteItem.id,
          FlotaId: this.deleteItem.flotaId,
          ClienteCompartidoId: this.deleteItem.flotaId,
          ClienteAceptacionId: this.deleteItem.clienteAceptacionId,
          UsuarioComparteId: this.deleteItem.usuarioComparteId,
          UsuarioAceptacionId: this.deleteItem.usuarioAceptacionId,
          Descripcion: this.deleteItem.descripcion,
        });
      } else {
        items.forEach((item: any) => {
          model.push({
            Id: item.data.id,
            FlotaId: item.data.flotaId,
            ClienteCompartidoId: item.data.flotaId,
            ClienteAceptacionId: item.data.clienteAceptacionId,
            UsuarioComparteId: item.data.usuarioComparteId,
            UsuarioAceptacionId: item.data.usuarioAceptacionId,
            Descripcion: item.data.descripcion,
          });
        });
      }

      this.axiosVehiculos.http
        .delete('flotaCompartida/eliminarFlotaCompartida', { data: model })
        .then(res => {
          if (items.length === 0) {
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.eliminar', {
                entidad:
                  'No se continuará recibiendo información de la Flota que ',
                nombre: '',
                eliminadaO: 'seleccionada.',
              })
            );
          } else {
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.eliminarMasivo', {
                los_cantidad_entidad_seleccionados:
                  'No se continuará recibiendo información de las Flotas que ',
                eliminadaOs: 'seleccionadas.',
              })
            );
          }

          this.gridApi.deselectAll();
          this.gridApi.setServerSideDatasource(this.serverSide);
        })
        .catch(err => {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                'las ' + items.length + ' Flotas',
              eliminadaOs: 'seleccionadas',
            })
          );
        });
    }
  }

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action === Accion.NoRecibirInformacion) {
        this.axiosVehiculos.http
          .get('flotaCompartida/' + data.id)
          .then(res => {
            this.deleteItem = res.data;
            this._titulo =
              'Dejar de recibir información de flota: ' + res.data.flota.nombre;
            this._mensaje =
              '¿Esta seguro que desea dejar de recibir información de la flota ' +
              res.data.flota.nombre +
              ' de forma definitiva?';
            this.dialogEliminar = true;
          })
          .catch(err => {});
      }
    });
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>
