<template>
  <v-container fluid grid-list-md>
    <v-flex xs12>
      <v-tabs left color="transparent">
        <v-tab :href="`#tab-1`">Alertas</v-tab>
      </v-tabs>
    </v-flex>
    <v-divider></v-divider>
    <v-layout row wrap>
      <v-flex xs12 sm6 md3>
        <v-select
          label="Filtrar Por Todos"
          v-model="tipoAlerta"
          :items="tiposAlertas"
          class="styled-select"
        ></v-select>
      </v-flex>
      <v-flex xs12 sm6 md4>
        <div align="center">
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
      <v-flex md1></v-flex>
      <v-flex xs12 sm6 :md2="accionCrear.visible" :md4="!accionCrear.visible">
        <div align="right" style="padding-top:15px">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            @click="crear()"
            style="padding-right:20px;"
          >
            <v-icon dark left style="color=black;">add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <div v-if="accionEliminar.visible">
      <v-layout
        row
        wrap
        class="animated fadeIn fast"
        v-if="muestraBarraBotones"
      >
        <v-flex md3>
          <v-btn flat small class="btn-barra" @click="eliminarSeleccionadas">
            <v-icon>delete</v-icon>&nbsp;&nbsp;Eliminar Seleccionadas
          </v-btn>
        </v-flex>
      </v-layout>
    </div>
    <v-divider></v-divider>
    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px;font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
    <v-divider></v-divider>

    <app-alertas-modal-nuevo
      :show="showModalNew"
      v-on:modalAsociacionEmit="alertaModalCallback($event)"
    ></app-alertas-modal-nuevo>

    <app-alertas-modal-edicion
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :alerta="editedItem"
      v-on:modalAsociacionEmit="alertaModalCallback($event)"
    ></app-alertas-modal-edicion>

    <app-confirmacion
      :show="dialogEliminar"
      :titulo="tituloEliminar"
      :mensaje="mensajeEliminar"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import config from '@/config/index';
import moment from 'moment';
import AlertasModalNuevo from '@/components/plataforma/AlertasModalNuevo.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { AlertasInterface } from '@/interfaces/Alertas';
import store from '@/store';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import MenuItem from '@/components/MenuItem.vue';
import { eventBus, actionsEvent } from '@/setup';
import { ServicioProxy, Accion } from '@/config/enums';
import { EstadoEntidad } from '@/config/enums';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': () => import('@/components/Confirmation.vue'),
    'app-alertas-modal-nuevo': AlertasModalNuevo,
    'app-alertas-modal-edicion': () =>
      import('@/components/plataforma/AlertasModalEdicion.vue'),
  },
})
export default class Alertas extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Alertas;
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
  //Variables globales
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  muestraBarraBotones: boolean = false;
  autoGroupColumnDef: any = null;
  gridOptions: GridOptions;
  showModalNew: boolean = false;
  dictionaryFormErrors: any = {};
  serverSide: any;
  dialogEliminar: Boolean = false;
  dialogConfirmEliminarSeleccionadas: Boolean = false;
  menuDatePicker: boolean = false;
  editedItem: AlertasInterface = {};
  $snotify: any;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  localeText: any = config.agGridTextos;
  seleccionoTodosModulos: boolean = false;
  paramsExportar: any; //Parametros para Exportar
  search: string = '';
  intervalo: any; //Intervalo para el buscador
  loadingService = new LoadingService();
  mensajeEliminar: any = '';
  tituloEliminar: any = '';
  editedIndex: number = -1;
  eliminarMasivoMensajes: any = [];
  cantidadEliminarMasivo: number = 0;
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];

  deleteMasivo: boolean = false;
  showModalEdit: boolean = false;
  modalEsEdicion: boolean = false;

  //AXIOS
  axiosAlertas: AxiosVue = new AxiosVue(ServicioProxy.Alerta);

  tipoAlerta: string = 'Exceso de Velocidad';
  tiposAlertas: any[] = ['Exceso de Velocidad'];

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
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre Alerta',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Cantidad Eventos',
        field: 'cantidadEventos',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        sortable: true,
        minWidth: 100,
        lockPinned: true,
        width: 170,
        // cellRenderer: (r: any) => {
        //   return EstadoEntidad[r.data.estado];
        // },
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Color',
        field: 'color',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Temporalidad',
        field: 'temporalidad',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Tipo Alerta',
        field: 'tipoAlerta',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        sortable: true,
        width: 180,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        //type: 'fecha',
      },
      {
        headerName: 'Creada por',
        field: 'usuarioCreador',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        //type: 'fecha',
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
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        filter: false,
        suppressMovable: true,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
      },
    ];

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCopyRowsToClipboard: true,
      localeText: this.localeText,
      onGridReady: this.onGridReady,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      onSelectionChanged: this.onSelectionChanged,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  crear() {
    this.editedItem = {};
    this.showModalNew = true;
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
  }

  mounted() {
    eventBus.changeTitlePage('Alertas');
  }

  async created() {
    await this.initialize();
  }

  async initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
          entidad: 'la Alerta',
        });
        this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
          entidad: 'Alerta',
          nombreEntidad: config.getValorCelda(this.gridApi, data.id, 'nombre'),
        });
        this.editedIndex = data.id;
        this.eliminarItem();
      } else if (
        data.action == Accion.Editar ||
        data.action == Accion.VerDetalle
      ) {
        //Editar
        if (data.action == Accion.Editar) {
          this.modalEsEdicion = true;
        } else {
          this.modalEsEdicion = false;
        }

        this.editedIndex = data.id;
        let item: any = null;

        this.gridApi.forEachNode((rowNode: RowNode) => {
          if (data.id == rowNode.data.id) {
            item = rowNode.data;
            return true;
          }
        });

        if (item !== null) {
          this.editedItem = item;
          this.showModalEdit = true;
        }
      }
    });
  }

  async eliminarSeleccionadas() {
    const items = this.gridApi.getSelectedNodes();
    this.cantidadEliminarMasivo = this.gridApi.getSelectedNodes().length;
    let index: number = 0;

    if (this.gridApi.getSelectedNodes().length === 1) {
      this.tituloEliminar = this.$t('mensajes.crud.eliminar.titulo', {
        entidad: 'Alerta',
        nombreEntidad: this.gridApi.getSelectedNodes()[0].data.nombre,
      });
      this.mensajeEliminar = this.$t('mensajes.crud.eliminar.mensaje', {
        entidad: 'la Alerta',
      });
      this.editedIndex = this.gridApi.getSelectedNodes()[0].data.id;
      this.dialogEliminar = true;

      //elimacion por lote masivo
    } else {
      this.deleteMasivo = true;
      this.mensajeEliminar = this.$t('mensajes.crud.eliminarMasivo.mensaje', {
        los_cantidad_entidad_seleccionados:
          this.gridApi.getSelectedNodes().length > 1
            ? 'las ' +
              this.gridApi.getSelectedNodes().length +
              ' Alertas seleccionadas'
            : 'la Alerta seleccionada',
      });
      this.tituloEliminar = 'Eliminar Alertas';
      this.dialogEliminar = true;
    }
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.dialogConfirmEliminarSeleccionadas = val;
  }

  //////////////////////////////////////
  ///Grilla
  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
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
          self.paramsExportar = params; //Parametros al Exportar
          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);

          self.axiosAlertas
            .http(`AlertaConfiguracion/${self.clienteId}/grid`, {
              params: params.request,
            })
            .then(res => {
              if (res.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(res.data.data, res.data.lastRow);
                self.gridApi.forEachNode(node => {
                  node.setSelected(false);
                });

                self.gridApi.forEachNode(node => {
                  let existe = idFilasSeleccionadas.find(
                    (x: any) => x === node.data.id
                  );
                  if (existe !== null && existe !== undefined) {
                    node.setSelected(true);
                  }
                });
                self.gridApi.hideOverlay();
              }
              //self.gridApi.sizeColumnsToFit();
              self.loadingService.hideLoading();
            })
            .catch(err => {
              if (!err.response) {
                if (err.response.status !== 401) {
                  self.$snotify.error('Ocurrió un error en la búsqueda.');
                }
              }
              params.failCallback();
              self.loadingService.hideLoading();
            });
        },
      };
      this.gridApi.setServerSideDatasource(this.serverSide);
    });
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

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    const self = this;
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosAlertas
        .http(`AlertaConfiguracion/${self.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Alertas.csv',
            respServer.data.data,
            this.columnDefs
          );
          this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
        })
        .catch(err => {
          if (!err.response) {
            this.$snotify.error('Ocurrió un error al exportar.');
          }
        });
    } else {
      this.$snotify.warning('No existen datos para exportar.');
    }
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

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows();
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      if (this.deleteMasivo) {
        await this.eliminarAlertaMasivo(); //Eliminación Masiva
      } else {
        await this.eliminarAlerta(); //Eliminación Unica
      }
    }
    this.deleteMasivo = false;
  }

  async eliminarAlertaMasivo() {
    const items = this.gridApi.getSelectedNodes();
    this.loadingService.showLoading();
    try {
      if (this.gridApi.getSelectedNodes().length > 0) {
        let index = 0;
        this.eliminarMasivoMensajes = [];

        for (let i = 0; i <= items.length - 1; i++) {
          const res = await this.axiosAlertas.http.delete(
            `AlertaConfiguracion/${items[i].data.id}`
          );
          index = index + 1;
          if (index == items.length) {
            let msj: any = this.$t('mensajes.mensajesExito.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'Las ' + items.length + ' Alertas seleccionadas'
                  : 'La Alerta seleccionada',
              eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
            });
            if (items.length === 1) {
              msj = msj.toString().replace('han', 'ha');
            }
            this.$snotify.success(msj);
            this.muestraBarraBotones = false;
            this.gridApi.deselectAll();
            this.gridApi.setServerSideDatasource(this.serverSide);
          }
        }
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminarMasivo', {
              los_cantidad_entidad_seleccionados:
                items.length > 1
                  ? 'las ' + items.length + 'Alertas'
                  : 'La Alerta',
              eliminadaOs: 'seleccionadas',
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminarMasivo', {
            los_cantidad_entidad_seleccionados:
              items.length > 1
                ? 'las ' + items.length + 'Alertas'
                : 'La Alerta',
            eliminadaOs: 'seleccionadas',
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarAlerta() {
    this.loadingService.showLoading();
    try {
      const delAlerta = await this.axiosAlertas.http.delete(
        `AlertaConfiguracion/${this.editedIndex}`
      );
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.eliminar', {
          entidad: 'La Alerta',
          nombre: config.getValorCelda(
            this.gridApi,
            this.editedIndex,
            'nombre'
          ),
          eliminadaO: 'eliminada',
        })
      );
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la Alerta',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'nombre'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la Alerta',
            nombre: config.getValorCelda(this.gridApi, this.editedIndex, 'id'),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async eliminarItem() {
    this.loadingService.showLoading();
    this.deleteMasivo = false;
    this.eliminarMasivoMensajes = [];

    try {
      this.dialogEliminar = true;
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la Alerta',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'id'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la Alerta',
            nombre: config.getValorCelda(this.gridApi, this.editedIndex, 'id'),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  alertaModalCallback(val: boolean) {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 0);
  }

  formatDate(date: String) {
    if (!date) return null;

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>
