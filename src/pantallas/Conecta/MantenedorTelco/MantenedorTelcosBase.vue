<template>
  <div class="resportesserie">
    <div class="flex sm10 md10">
      <FormFieldsContainer @resultadoBusqueda="filtroRequerimiento">
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm4 md4>
              <v-text-field
                style="margin-right:5px;"
                label="Buscar..."
                append-icon="search"
                v-model="filtrobusquedagrilla"
                @input="searchData"
                clearable
              ></v-text-field>
            </v-flex>
            <v-flex sm3 md3 align="rigth"> </v-flex>
            <v-flex sm2 md2 align="rigth"> </v-flex>
            <v-flex sm3 md3 align="rigth">
              <v-btn
                style="padding-right:20px; padding-right: 20px; display: block; margin: 0 0 0 auto; margin-top: 15px"
                color="#ffe800"
                @click="crear_estado"
              >
                <v-icon dark left style="color: black;"
                  >add_circle_outline</v-icon
                >
                <span style="color: black;">Crear</span>
              </v-btn>
            </v-flex>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>
    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>
    <VerEditarRutaModal
      v-if="mostrarModalVerDetalle"
      :telcoid="telcoid"
      :telconame="telconame"
      :telcoprefix="telcoprefix"
      :usuarioID="usuarioID"
      @cerrar="handleCierreModalVerDetalle"
    />
    <VerCrearRutaModal
      v-if="mostrarModalCrear"
      :telcoid_crear="telcoid_crear"
      @cerrar="handleCierreModalCrear"
    />
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import VerEditarRutaModal from './VerEditarRutaModal.vue';
import VerCrearRutaModal from './VerCrearRutaModal.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  RowNode,
  ICellRendererParams,
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';

import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';

import { Accion } from '@/config/enums';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    VerEditarRutaModal,
    FormFieldsContainer,
    VerCrearRutaModal,
  },
})
export default class MantenedorTelcosBase extends ComponenteBase {
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.MantenedorTelco;

  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  mostrarModalVerDetalle: boolean = false;
  mostrarModalCrear: boolean = false;
  //MsResponseData: MsResponseData = null;
  //MsResponseDataWidget: MsResponseDataWidget = null;
  telcoid: Number = null;
  telconame: string = null;
  telcoprefix: string = null;
  serverSide: any;
  gridApi: GridApi = null;
  showReporteGenerado: boolean = false;
  texto_reporte: string = '';
  ordesList: any[] = [];
  showModalMostrar: boolean = false;
  usuarioID: any = '';
  telcoid_crear: any = '';

  initialize() {
    actionsEvent.$on('actionsEvent', (data: any) => {
      if (this.funcionalidad === Funcionalidades.ReportesSerie) {
        if (data.action === Accion.VerDetalle) {
          // Editar - Ver Detalle
          let item: any = null;
          this.gridApi.forEachNode((rowNode: RowNode) => {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              return true;
            }
          });
          if (item !== null) {
            this.showModalMostrar = true;
          }
        }
      }
    });
  }
  async getReportes(usuarioID: any) {
    let self = this;
    this.telcoid_crear = await fetchReportesSerie(
      { '': '' },
      'mantenedor_telco/crear_telco_id'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return Number(data.data.data.max) + 1;
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
    this.loadingService.showLoading();
    return fetchReportesSerie({ usuarioID: usuarioID }, 'mantenedor_telco')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
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

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Id',
        field: 'telcoid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Nombre',
        field: 'telconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 410,
      },
      {
        headerName: 'Prefijo',
        field: 'telcoprefix',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 410,
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };

  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }

  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  //Busca dentro del resultado de la grilla
  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar];

  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerDetalleClick);
  }

  handleVerDetalleClick(params: ICellRendererParams) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).nombre;
    this.telcoid = params.data.telcoid;
    this.telconame = params.data.telconame;
    this.telcoprefix = params.data.telcoprefix;
    this.mostrarModalVerDetalle = true;
  }
  async handleCierreModalVerDetalle() {
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
    this.mostrarModalVerDetalle = false;
  }

  async crear_estado() {
    this.mostrarModalCrear = true;
    let self = this;
    this.loadingService.showLoading();
  }
  async handleCierreModalCrear() {
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
    this.mostrarModalCrear = false;
  }

  closeReporte() {
    this.showReporteGenerado = false;
    this.texto_reporte = '';
  }

  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }
}
</script>
<style scope>
.reportesSerieConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieConecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.resportesserie .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
