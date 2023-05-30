<template>
  <div class="configurar-alertas">
    <div class="layout wrap">
      <!--v-flex offset-sm3 offset-md3 sm2 md2>
        <v-select
          v-model="formFields.tipoAlerta.value"
          :label="formFields.tipoAlerta.label"
          :items="listaTiposAlerta"
          item-text="nombre"
          item-value="id"
        />
      </v-flex>
      <v-flex sm2 md2>
        <v-text-field
          v-model="formFields.mail.value"
          :label="formFields.mail.label"
          single-line
          hide-details
        />
      </v-flex>
      <v-flex sm2 md2>
        <div class="text-sm-center">
          <v-btn flat icon small  @click="guardar">
            <v-icon class="BtnIcon">save</v-icon>
          </v-btn>
        </div>
      </v-flex>
    </div-->
      <v-flex xs12 sm2 md2>
        <v-text-field
          style="margin-right:5px;"
          v-model="filtrobusquedagrilla"
          @input="searchData"
          label="Buscar..."
        ></v-text-field>
      </v-flex>
      <v-flex offset-md8 xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            style="padding-right:20px;"
            @click="handleModalClick('crear')"
          >
            <v-icon dark left style="color: black;">add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
    </div>
    <v-flex sm12 md12 ridcard rounded-card>
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </v-flex>
    <ConfigurarAlertaModal
      v-if="mostrarConfigurarAlertaModal"
      @cerrar="handleCierreConfigurarAlertaModal"
      @changeFlota="changeFlota"
      :registroSeleccionado="registroSeleccionado"
      :esEditar="esEditar"
      :listaFlotas="listaFlotas"
      :listaGrupos="listaGrupos"
    />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import VerDetalleAlertaModal from '@/pantallas/Camaras/Alertas/VerDetalleAlerta.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
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
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import {
  fetchTiposAlerta,
  ConfigTiposAlerta,
} from '@/pantallas/Camaras/Alertas/fetchTipoAlerta';
import ConfigurarAlertaModal from '@/pantallas/Camaras/ConfigurarAlertas/ConfigurarAlertaModal.vue';
import { requestConfigAlerta } from '@/pantallas/Camaras/ConfigurarAlertas/requestsConfigAlerta';

import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils';

import {
  fetchFlotas,
  ConfigFlotas,
  ConfigGrupos,
  fetchGrupos,
} from '@/pantallas/Camaras/Alertas/fetchFlota';

@Component({
  components: {
    MantenedorGridSinCodigo,
    ConfigurarAlertaModal,
    //FiltrosBusqueda,
  },
})
export default class ConfigurarAlertas extends ComponenteBase {
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ConfigurarAlertas;
  filtrobusquedagrilla: string = '';

  loadingService = new LoadingService();

  registroSeleccionado: any = null;
  mostrarConfigurarAlertaModal: boolean = false;
  esEditar: boolean = false;

  listaTiposAlerta: ConfigTiposAlerta[] = [];
  listaFlotas: ConfigFlotas[] = [];
  listaGrupos: ConfigGrupos[] = [];
  filtros_total: number = 2;
  filtros_cargados: number = 0;
  forcehide: boolean = false;

  columnApi: any = null;

  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID',
        field: 'id',
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Mail',
        field: 'mail',
        cellStyle: { textAlign: 'left' },
        width: 300,
      },
      {
        headerName: 'Alertas Configuradas',
        field: 'alertas',
        cellStyle: { textAlign: 'left' },
        width: 300,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        cellStyle: { textAlign: 'left' },
        width: 300,
      },
      {
        headerName: 'Alertas',
        field: 'alertas_original',
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Flotas',
        field: 'flota',
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Grupo',
        field: 'grupo',
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
    ],
    pagination: true,
    paginationPageSize: 50,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    onSelectionChanged: this.onSelectionChanged,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };

  valida_filtros_cargados() {
    this.filtros_cargados += 1;
    if (this.forcehide) {
      this.forcehide = false;
      this.loadingService.hideLoading();
      return;
    }
    if (this.filtros_cargados == this.filtros_total) {
      this.loadingService.hideLoading();
      this.filtros_cargados = 0;
    }
  }

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.getConfigsAlertas();
  }
  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }

  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }

  onSelectionChanged(params: any) {
    //console.log('seleccionados');
    //console.log(this.gridApi.getSelectedNodes());
  }

  async getConfigsAlertas() {
    const body: {} = {
      id_cliente: JSON.parse(
        window.localStorage.user
      ).clienteDefecto.toString(),
    };
    this.loadingService.showLoading();
    requestConfigAlerta(body, 'getConfigVigilanti')
      .then((response: any) => {
        if (response.status == 200) {
          if (response.data.CODIGO_RESPUESTA == '1') {
            if (response.data.data.length == 0) {
              this.$snotify.error('Sin registros', { timeout: 3000 });
              this.gridApi.setRowData([]);
            } else {
              this.gridApi.setRowData(response.data.data);
              this.autoSizeAll(false);
              //this.gridApi.sizeColumnsToFit();
              //this.columnApi.autoSizeColumns(["alertas"]);
            }
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
            this.gridApi.setRowData([]);
          }
        } else {
          this.$snotify.error('Error de conexión', { timeout: 3000 });
          this.gridApi.setRowData([]);
        }
        //this.gridApi.setRowData(response.data.data);
      })
      .catch((error: any) => {
        this.$snotify.error('Error de conexión', { timeout: 3000 });
        console.log(error);
        this.gridApi.setRowData([]);
      })
      .finally(() => {
        this.gridApi.setDomLayout('autoHeight');
        this.loadingService.hideLoading();
      });
  }

  async deleteConfigAlertas(id: string, mail: string) {
    const body: {} = {
      id_cliente: JSON.parse(
        window.localStorage.user
      ).clienteDefecto.toString(),
      id: id,
      mail: mail,
    };
    this.loadingService.showLoading();
    requestConfigAlerta(body, 'deleteConfigVigilanti')
      .then((response: any) => {
        if (response.status == 200) {
          if (response.data.CODIGO_RESPUESTA == '1') {
            this.$snotify.success('Registro eliminado correctamente', {
              timeout: 3000,
            });
            this.getConfigsAlertas();
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
          }
        } else {
          this.$snotify.error('Error de conexión', { timeout: 3000 });
        }
        //this.gridApi.setRowData(response.data.data);
      })
      .catch((error: any) => {
        this.$snotify.error('Error de conexión', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  get fechaMaxima() {
    let fechaMax: any = new Date().toISOString().substr(0, 10);
    return fechaMax;
  }

  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  fechaQuickFilterGetter(params: GetQuickFilterTextParams) {
    return this.formatFecha(params.value);
  }

  fechaValueFormatter(params: ValueFormatterParams) {
    return this.formatFecha(params.value);
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };
  accionEditar: PermisoAccion = {
    accionCodigo: 3,
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
    this.accionEditar,
  ];

  handleModalClick() {
    this.getFlotas();
    this.getGrupos('');
    this.registroSeleccionado = null;
    this.mostrarConfigurarAlertaModal = true;
    this.esEditar = false;
  }
  handleCierreConfigurarAlertaModal() {
    this.mostrarConfigurarAlertaModal = false;
    this.getConfigsAlertas();
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onEliminar(this.handleEliminarClick);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }
  handleEditarClick(params: ICellRendererParams) {
    this.registroSeleccionado = params.data;
    this.mostrarConfigurarAlertaModal = true;
    this.esEditar = true;
    this.getFlotas();
    this.getGrupos('');
  }
  handleEliminarClick(params: ICellRendererParams) {
    this.deleteConfigAlertas(params.data.id, params.data.mail);
  }

  formFields: FormFieldDefMap = {
    tipoAlerta: {
      label: 'Tipo Alerta',
      id: 'tipoAlerta',
      value: '',
    },
    mail: {
      label: 'Mail',
      id: 'mail',
      value: '',
    },
  };

  changeFlota(e: any) {
    this.$emit('changeFlota', this.formFields);
  }

  async getGrupos(flota: string) {
    this.loadingService.showLoading();
    this.listaGrupos = (await this.cargarGrupos(flota)) || [];
  }
  cargarGrupos(flota: string) {
    return fetchGrupos(flota)
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los grupos',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los grupos',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }

  async getFlotas() {
    this.loadingService.showLoading();
    this.listaFlotas = (await this.cargarFlotas()) || [];
  }

  cargarFlotas() {
    return fetchFlotas()
      .catch(error => {
        if (error.message == 'Network Error') {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las flotas',
            { timeout: 3000 }
          );
        } else if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener las flotas',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.valida_filtros_cargados());
  }
  guardar() {}
}
</script>
<style>
.hide {
  display: none !important;
}
div[col-id='checked'] {
  pointer-events: all !important;
}
.configurar-alertas .ag-body-viewport .ag-pinned-left-cols-container,
.configurar-alertas .ag-header .ag-pinned-left-header {
  display: none;
}
.BtnIcon {
  color: #526da5 !important;
}
.configurar-alertas .estilo-grilla {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
