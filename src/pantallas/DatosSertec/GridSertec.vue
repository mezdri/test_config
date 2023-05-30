<template>
  <div class="ma-3 gridcard rounded-card mb-5 ">
    <v-layout>
      <v-text-field
        class="ma-4"
        name="busqueda"
        @input="onFilterTextBoxChanged"
        v-model="search"
        append-icon="search"
        label="Búsqueda."
        single-line
        hide-details
      ></v-text-field>
      <!-- <div align="right" style="padding-top: 15px" class="ma-4">
        <v-btn @click="exportar()" flat small color="primary">
          <v-icon class="importExportBtnIcon">cloud_download</v-icon
          >&nbsp;&nbsp;
          <span class="importExportBtnTexto">Exportar</span>
        </v-btn>
      </div> -->
    </v-layout>
    <ag-grid-vue
      style="width: 100%; height: 400px; font-family: 'Asap', sans-serif"
      class="ag-theme-material"
      :columnDefs="columnDefs"
      :rowData="rowData"
      @grid-ready="onGridReady"
      :pagination="true"
      paginationPageSize="10"
    ></ag-grid-vue>
    <!-- :gridOptions="gridOptions" -->
    <app-confirmacion
      :show="showConfirmacion"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="' ¿Desea eliminar el registro permanentemente ? '"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="'Eliminar'"
      :textoBtnNo="'Cancelar'"
    ></app-confirmacion>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Accion } from '@/config/enums';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import { codigoAccionesMenuItem } from '@/views/base/VariablesPermisos';
import MenuItem from '@/components/MenuItemEsmax.vue';
import { asociacionEventBus } from '@/setup';
import store from '@/store';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
const { AgGridVue } = require('ag-grid-vue');
import { ColDef } from 'ag-grid-community';
import config from '@/config/index';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
  },
})
export default class GridSertec extends Vue {
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.Vehiculos;
  showConfirmacion = false;
  gridApi: any = null;
  columnApi: any = null;
  columnDefs: Array<ColDef> = [];
  clienteId: number = null;
  rowData: any[] = [];
  bodyEliminar: any = {};
  urlEliminar: string = '';
  body: any = {};
  url: string = '';
  $snotify: any;
  search: string = '';
  paramsExportar: any;

  confirmCallbackConfirm(val: boolean) {
    val ? this.eliminar() : (this.showConfirmacion = false);
    //vamos a entender que al desasociar tenemos que mantener el select all
  }
  onGridReady(params: any) {
    this.paramsExportar = params.api;
    this.gridApi = params.api;
    this.columnApi = params.api;
  }
  onFilterTextBoxChanged() {
    if (this.search === null) this.search = '';
    this.gridApi.setQuickFilter(this.search.length > 1 ? this.search : '');
  }
  async eliminar() {
    this.showConfirmacion = false;
    let ResultadoEliminacion = await fetchDashboard(
      this.bodyEliminar,
      this.urlEliminar
    );
    ResultadoEliminacion.data.CODIGO_RESPUESTA == 1
      ? (this.$snotify.success(ResultadoEliminacion.data.MENSAJE_RESPUESTA),
        this.getGrilla())
      : this.$snotify.error(ResultadoEliminacion.data.MENSAJE_RESPUESTA);
  }
  async mounted() {
    let result;
    this.clienteId = parseInt(localStorage.getItem('clienteDefecto'));
    this.body = {
      id_cliente: this.clienteId,
    };
    this.url = '/mantenedor_sertec/get_grilla';
    this.getGrilla();
    this.columnDefs = [
      {
        headerName: 'N° de caso',
        field: 'nro_caso',
        filter: 'agSetColumnFilter',
        sortable: true,
        sort: 'desc',
      },
      { headerName: 'Planta', field: 'planta', filter: 'agSetColumnFilter' },
      { headerName: 'Patente', field: 'patente', filter: 'agSetColumnFilter' },
      { headerName: 'Tipo Caso', field: 'tipo_caso' },
      { headerName: 'Transportista', field: 'transportista' },
      { headerName: 'Horas Solución', field: 'horas_o_dias_en_solucion' },
      { headerName: 'Producto', field: 'producto' },
      { headerName: 'Estado', field: 'estado' },
      { headerName: 'Motivo Rechazo', field: 'motivo_rechazo' },
      { headerName: 'Fecha Solución', field: 'fecha_solucion_definitiva' },
      {
        headerName: 'Fecha Coordinación',
        field: 'fecha_coordinacion_trabajos',
      },
      { headerName: 'Fecha Apertura', field: 'fecha_apertura_ticket' },
      { headerName: 'Fecha Origen', field: 'fecha_origen_falla' },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
          usuario: store.state.user,
          funcionalidad: this.funcionalidad,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        filter: false,
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        suppressMovable: true,
      },
    ];

    actionsEvent.$on('actionsEvent', async (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.urlEliminar = 'mantenedor_sertec/eliminar';
        this.bodyEliminar = {
          id_cliente: this.clienteId,
          nro_caso: data.cellRendererParams.data.nro_caso,
        };
        this.showConfirmacion = true;
      } else if (data.action == Accion.Editar) {
        asociacionEventBus.$emit('editar', data.cellRendererParams.data);
      }
    });
  }
  async getGrilla() {
    let result;
    result = await fetchDashboard(this.body, this.url);
    result.data.CODIGO_RESPUESTA == 1
      ? (this.rowData = await result.data.data)
      : this.$snotify.error(this.$t(result.data.MENSAJE_RESPUESTA));
  }
  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();

    let colums = this.rowData;
    if (totalFilas > 0) {
      config.crearArchivoCsv('datosSertec.csv', colums, this.columnDefs);
      this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
    }
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response;
  }
}
</script>
