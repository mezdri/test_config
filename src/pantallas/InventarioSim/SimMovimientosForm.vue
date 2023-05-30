<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Movimientos</StepTitle>
          <v-divider></v-divider>
          <br />

          <CabeceraTabla>
            <template v-slot:izquierda>
              <BuscadorOperacionCrud
                :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
              />
            </template>
          </CabeceraTabla>
          <div align="left">
            <MantenedorGrid :grid-options="gridOptions" />
          </div>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { Component, Prop } from 'vue-property-decorator';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { Snotify } from '@/snotify/Snotify';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { fetchReportesSerie } from './fetchReporteSerie';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    CabeceraTabla,
    MantenedorGrid,
    MantenedorGridVerDetalle,
    FormFieldsContainer,
  },
})
export default class SimMovimientosForm extends ComponenteBase {
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) simestadolistSeleccionado: any;
  @Prop({ default: false }) modoVer: boolean;

  /* ComponenteBase */
  ordesList: any[] = [];
  serverSide: any;
  showReporteGenerado: boolean = false;

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: true,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;
  simestadolist: any[] = [];
  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Movimiento',
        field: 'movinumero',
        lockVisible: true,
      },
      {
        headerName: 'Fecha de Alta',
        field: 'movifecha_alta',
        lockVisible: true,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD');
        },
      },
      {
        headerName: 'Ubicación',
        field: 'tipoubicaname',
        lockVisible: true,
      },
      {
        headerName: 'Descripción de Operación',
        field: 'configdescripcion',
        lockVisible: true,
      },

      {
        headerName: 'Número de Operación',
        field: 'moviopera_numero',
        lockVisible: true,
      },
      {
        headerName: 'Observación del Movimiento',
        field: 'moviobs',
        lockVisible: true,
      },
      {
        headerName: 'Fecha de Recepción',
        field: 'movifecha_recibe',
        lockVisible: true,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD');
        },
      },
      {
        headerName: 'Operación',
        field: 'configvalor',
        lockVisible: true,
      },
      {
        headerName: 'Número de Serie',
        field: 'simserienumero',
        lockVisible: true,
      },
      {
        headerName: 'Equipo',
        field: 'tipoeqname',
        lockVisible: true,
      },
      {
        headerName: 'Serie Activa',
        field: 'serieactivanro',
        lockVisible: true,
      },
    ],
    pagination: true,
    singleClickEdit: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    suppressCopyRowsToClipboard: true,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */
  async getSerie_by_id(serieNumeroSeleccionado: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        serienumero: serieNumeroSeleccionado,
      },
      'conecta_inventario_sim/movimientos'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data[0].STATUS == 'SIN_DATA') {
            self.gridApi.showNoRowsOverlay();
            return;
          }

          return data.data.data;
        }
      })
      .catch((error: any) => {
        return;
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getSerie_by_id(this.serieNumeroSeleccionado);

    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.serverSide = {};
  }
  crear_estado() {
    this.showReporteGenerado = true;
  }
  closeReporte() {
    this.showReporteGenerado = false;
  }
}
</script>
<style scoped>
.ModalEdit {
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}
#desactivadores {
  min-width: 1000px;
  max-width: 500px;
  width: 30%;
}
.desplegable {
  border-radius: 0;
  z-index: 99999 !important;
}
</style>
