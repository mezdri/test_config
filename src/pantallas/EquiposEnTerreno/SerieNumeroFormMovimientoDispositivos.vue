<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Movimientos de Dispositivos</StepTitle>
          <v-divider></v-divider>
          <br />
          <CabeceraTabla>
            <template v-slot:izquierda>
              <BuscadorOperacionCrud
                :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
              />
            </template>
          </CabeceraTabla>
          <div align="left" class="ReportesSerieMovimientos">
            <MantenedorGridVerDetalle :grid-options="gridOptions" />
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

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    CabeceraTabla,
    MantenedorGrid,
    MantenedorGridVerDetalle,
  },
})
export default class SerieNumeroFormMovimientoDispositivos extends ComponenteBase {
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;

  /* ComponenteBase */
  ordesList: any[] = [];
  serverSide: any;
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Movimiento Número',
        field: 'movinumero',
        hide: true,
      },
      {
        headerName: 'Fecha de Movimiento',
        field: 'movifecha_alta',
        lockVisible: true,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY/MM/DD HH:mm:ss');
        },
      },
      {
        headerName: 'Ubicación',
        field: 'tipoubicaname',
        lockVisible: true,
      },
      {
        headerName: 'Tipo de Operacion',
        field: 'configdescripcion',
        lockVisible: true,
      },
      {
        headerName: 'Número de la Operación',
        field: 'moviopera_numero',
        lockVisible: true,
      },
      {
        headerName: 'Observación',
        field: 'movifecha_recibe',
        lockVisible: true,
      },
      {
        headerName: 'Estado',
        field: 'configvalor',
        lockVisible: true,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */
  async getSerie_by_id(
    serieNumeroSeleccionado: any,
    tipoEquipoSeleccionado: any
  ) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        serieNumeroSeleccionado: serieNumeroSeleccionado,
        tipoEquipoSeleccionado: tipoEquipoSeleccionado,
      },
      'equipo_stock_terreno/seriemovimientos'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
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

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getSerie_by_id(
      this.serieNumeroSeleccionado,
      this.tipoEquipoSeleccionado
    );
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.serverSide = {};
  }
}
</script>
<style scoped></style>
