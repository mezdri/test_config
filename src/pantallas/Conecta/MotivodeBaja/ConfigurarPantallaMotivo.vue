<template>
  <div class="MotivodeBaja">
    <FormFieldsContainer>
      <v-flex sm4 md4>
        <v-text-field
          style="margin-right:5px;"
          label="Buscar..."
          append-icon="search"
          v-model="filtrobusquedagrilla"
          @input="searchData"
        ></v-text-field>
      </v-flex>
      <v-flex xs12 sm8 md8 style="padding-right: 0px">
        <div align="right" style="padding-top: 6px; padding-right: 0px">
          <v-btn
            class="btn-crear"
            @click="abrirmodal"
            style="padding-right: 20px"
          >
            <v-icon dark style="color=black" left>add_circle_outline</v-icon>
            <span>Crear</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex sm12 md12 ridcard rounded-card>
        <MantenedorGridSinCodigo
          :grid-options="gridOptions"
          :funcionalidad-id="funcionalidad"
        />
      </v-flex>
    </FormFieldsContainer>
    <VerEditarModal v-if="modalcrear" @cerrar="handleCierreModalVerDetalle" />

    <EditarGrilla
      v-if="mostrarModalEditar"
      @cerrar="handleCierreModal"
      :Motivo="Motivo"
      :estado="estado"
      :motiid="motiid"
    />
  </div>
</template>

<script lang="ts">
import VerEditarModal from './VerEditarModal.vue';
import EditarGrilla from './EditarGrilla.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Component } from 'vue-property-decorator';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { fetchReportesSerie } from '@/pantallas/Conecta/MantenedorServipag/fetchReporteSerie';
import moment from 'moment';
import BuscadorMantenedor from '@/reusable/Grid/BuscadorMantenedor.vue';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import { actionsEvent } from '@/setup';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils'; //plantilla
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
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
import { keys } from 'lodash';

@Component({
  components: {
    BuscadorMantenedor,
    EditarGrilla,
    VerEditarModal,
    MantenedorGridSinCodigo,
    FormFieldsContainer, //funcion que llamamos y ocupamos arriba
  },
})
export default class ConfigurarPantallaMotivo extends ComponenteBase {
  accionConsultar: PermisoAccion = { accionCodigo: 1, visible: false };
  accionEditar: PermisoAccion = { accionCodigo: 3, visible: false };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.accionEditar];
  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClick);
  }

  //llamamos a una clase para trabajar aqui dentro
  readonly funcionalidad: Funcionalidades = Funcionalidades.MotivodeBaja;
  ordesList: any[] = [];
  search: '';
  modalcrear: boolean = false;
  busquedaGrilla: string = '';
  filtrobusquedagrilla: string = '';
  Motivo: any;
  estado: any;
  motiid: any;
  diccionario = { t: 'Desactivado', f: 'Vigente' };

  detalleSeleccionado: any = null;
  mostrarModalEditar: boolean = false;

  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }
  handleEditarClick(params: ICellRendererParams) {
    this.motiid = params.data.motiid;
    this.Motivo = params.data.motiname;
    this.estado = params.data.motibaja;
    console.log(this.estado);
    this.mostrarModalEditar = true;
  }
  async handleCierreModal() {
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.mostrarModalEditar = false;
  }
  abrirmodal() {
    this.modalcrear = true;
  }

  async handleCierreModalVerDetalle() {
    this.modalcrear = false;
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');

    //this.handleBuscarClick();
  }

  //funcion para cargar la grilla
  async getReportes() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'MotivodeBaja')
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

  //grid (tabla)
  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Id',
        field: 'motiid',
        cellStyle: { textAlign: 'left' },
        width: 350,
        hide: true,
      },
      {
        headerName: 'Motivo',
        field: 'motiname',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Fecha Alta',
        field: 'motifecha_alta',
        cellStyle: { textAlign: 'left' },
        width: 350,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD' + ' HH:mm:ss');
        },
      },

      {
        headerName: 'Estado',
        field: 'motibaja',
        cellStyle: { textAlign: 'left' },
        width: 350,

        cellRenderer: params => {
          if (params.data.motibaja == 'desactivado') {
            return (
              '<i class="material-icons" title="Anulado" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Desactivado' +
              '</a>'
            );
          } else {
            return (
              '<i class="material-icons" title="Vigente" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: #26FF26"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Vigente' +
              '</a>'
            );
          }
        },
      },
    ],

    pagination: true,
    paginationPageSize: 25, //cantidad de datos a mostrar en inicio
    onGridReady: this.handleGridReady,
  };
  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getReportes();
    this.gridApi = event.api;
    console.log(this.ordesList);
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }
}
</script>
<style>
.MotivodeBaja
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.MotivodeBaja div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.MotivodeBaja
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}

.MotivodeBaja .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
