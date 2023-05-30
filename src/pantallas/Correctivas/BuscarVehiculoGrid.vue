<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle>Seleccionar Vehículo</StepTitle>
            <v-layout wrap>
              <v-flex xs12 md12 lg12>
                <v-radio-group
                  v-model="radiosVF"
                  row
                  @change="selectedRB"
                  v-if="!modoVer"
                >
                  <v-radio label="Flotas" value="rdbFlota"></v-radio>
                  <v-radio label="Etiquetas" value="rdbEtiquetas"></v-radio>
                  <v-radio label="Vehículos" value="rdbVehiculos"></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <CabeceraTabla v-show="configAsociar == 1">
              <template v-slot:izquierda>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiFlo && gridApiFlo.setQuickFilter.bind(gridApiFlo)
                  "
                  :disabled="modoVer"
                  prepend="directions_car"
                />
              </template>
            </CabeceraTabla>
            <div v-show="configAsociar == 1">
              <MantenedorGrid :grid-options="gridOptionsFlotas" />
            </div>
            <CabeceraTabla v-show="configAsociar == 2">
              <template v-slot:izquierda>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiEti && gridApiEti.setQuickFilter.bind(gridApiEti)
                  "
                  prepend="directions_car"
                />
              </template>
            </CabeceraTabla>
            <div v-show="configAsociar == 2">
              <MantenedorGrid :grid-options="gridOptionsEtiqueta" />
            </div>
            <CabeceraTabla v-show="configAsociar == 3">
              <template v-slot:izquierda>
                <BuscadorOperacionCrud
                  :filter="
                    gridApiVehi && gridApiVehi.setQuickFilter.bind(gridApiVehi)
                  "
                  prepend="directions_car"
                />
              </template>
            </CabeceraTabla>
            <div v-show="configAsociar == 3">
              <MantenedorGrid
                v-if="!modoVer"
                :grid-options="gridOptionsVehiculos"
              />
              <MantenedorGridVerDetalle
                v-if="modoVer"
                :grid-options="gridOptionsVehiculos"
              />
            </div>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import config from '@/config/index';
import store from '@/store';

import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { IVehiculo } from '../../interfaces/Vehiculos';
import { IEtiqueta } from '../../interfaces/Etiquetas';
import { IFlota } from '@/interfaces/Flota';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    MantenedorGridVerDetalle,
    MantenedorGrid,
    CabeceraTabla,
  },
})
export default class BuscarVehiculoGrid extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: null }) correctivoSeleccionado: Correctiva;
  /* state */

  lstFlota: IFlota[] = [];
  lstEtiquetas: IEtiqueta[] = [];
  lstVehiculos: IVehiculo[] = [];

  axContextoReporte: AxiosVue = new AxiosVue(ServicioProxy.Reporte);

  columnApiFlo: ColumnApi;
  columnApiVehi: ColumnApi;
  columnApiEti: ColumnApi;

  radiosVF: any = 'rdbFlota';
  configAsociar: number = 1;

  /* aggrid */

  gridApiFlo: GridApi = null;
  gridApiVehi: GridApi = null;
  gridApiEti: GridApi = null;

  /* template */

  readonly gridOptionsFlotas: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Padre',
        field: 'padre',
        width: 230,
        minWidth: 80,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridFloReady,
    onSelectionChanged: this.handleSeleccionFlota,
  };

  readonly gridOptionsEtiqueta: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Padre',
        field: 'padre',
        width: 230,
        minWidth: 80,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridEtiReady,
    onSelectionChanged: this.handleSeleccionEtiqueta,
  };

  readonly gridOptionsVehiculos: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockVisible: true,
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Flota',
        field: 'flotaNombre',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Vehiculo ',
        field: 'tipoVehiculo',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Año',
        field: 'ano',
        width: 230,
        minWidth: 80,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridVehiReady,
    onSelectionChanged: this.handleSeleccionVehiculo,
  };

  readonly gridOptionsVehiculosModoVer: GridOptions = {
    columnDefs: [
      {
        headerName: 'id',
        field: 'id',
        hide: true,
        minWidth: 80,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Flota',
        field: 'flotaNombre',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Referencia',
        field: 'referencia',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Tipo Vehiculo ',
        field: 'tipoVehiculo',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
        width: 230,
        minWidth: 80,
      },
      {
        headerName: 'Año',
        field: 'ano',
        width: 230,
        minWidth: 80,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    rowSelection: 'single',
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridVehiReady,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  selectedRB(e: any) {
    switch (e) {
      case 'rdbFlota':
        this.configAsociar = 1;
        break;
      case 'rdbEtiquetas':
        this.configAsociar = 2;
        break;
      case 'rdbVehiculos':
        this.configAsociar = 3;
        break;
    }
  }

  getVehiculosFlotasEtiquetas() {
    this.loadingService.showLoading();
    this.axContextoReporte.http
      .get('Reporte/' + store.state.userId + '/' + config.getClienteSesion())
      .then(res => {
        if (res !== null && res !== undefined) {
          this.lstFlota = res.data.flotas;
          this.lstEtiquetas = res.data.etiquetas;
          this.lstVehiculos = res.data.vehiculos;
        } else {
          this.lstFlota = [];
        }

        this.gridApiFlo.setRowData(this.lstFlota);
        this.gridApiEti.setRowData(this.lstEtiquetas);
        this.gridApiVehi.setRowData(this.lstVehiculos);
        this.setVehiculoSeleccionado();
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener flotas.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener flotas.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  setVehiculoSeleccionado() {
    if (this.correctivoSeleccionado) {
      const vehiculo = this.lstVehiculos.filter(
        x => x.id === this.correctivoSeleccionado.vehiculoId
      );
      this.gridApiVehi.setRowData(vehiculo);
    }
  }

  /* event handlers */

  async handleGridFloReady(event: GridReadyEvent) {
    this.gridApiFlo = event.api;
    this.getVehiculosFlotasEtiquetas();
  }

  async handleGridEtiReady(event: GridReadyEvent) {
    this.gridApiEti = event.api;
  }

  async handleGridVehiReady(event: GridReadyEvent) {
    this.gridApiVehi = event.api;
  }

  handleSeleccionFlota() {
    var lstVehiculosFiltrada: any[] = [];
    if (this.gridApiFlo.getSelectedRows().length > 0) {
      var lstVehiculos: any[] = [];
      this.gridApiFlo.getSelectedRows().forEach(flota => {
        lstVehiculos = this.lstVehiculos.filter(v => v.flota == flota.id);
        if (lstVehiculos) {
          lstVehiculosFiltrada = lstVehiculosFiltrada.concat(lstVehiculos);
        }
      });
      this.filtraEtiquetas(lstVehiculosFiltrada);
      this.gridApiVehi.setRowData(lstVehiculosFiltrada);
    } else {
      this.gridApiVehi.setRowData(this.lstVehiculos);
      this.gridApiEti.setRowData(this.lstEtiquetas);
    }
  }

  filtraEtiquetas(lstVehiculosFiltrada: any[]) {
    var listadoFiltadoEtiquetas: any[] = [];
    lstVehiculosFiltrada.forEach(vehiculo => {
      this.lstEtiquetas.forEach(eti => {
        var etiquetaId = vehiculo.etiquetas.find((e: any) => e === eti.id);
        if (etiquetaId) {
          if (!listadoFiltadoEtiquetas.find(x => x.id === etiquetaId)) {
            listadoFiltadoEtiquetas.push(eti);
          }
        }
      });
    });
    this.gridApiEti.setRowData(listadoFiltadoEtiquetas);
  }

  handleSeleccionEtiqueta() {
    var lstVehiculosFiltrada: any[] = [];
    if (this.gridApiEti.getSelectedRows().length > 0) {
      var etiquetas = this.gridApiEti.getSelectedRows();
      var lstVehiculos: any[] = [];
      this.lstVehiculos.forEach(vehi => {
        etiquetas.forEach(etiqueta => {
          var eti = vehi.etiquetas.find(e => e === etiqueta.id);
          if (eti) {
            lstVehiculosFiltrada.push(vehi);
          }
        });
      });
      this.gridApiVehi.setRowData(lstVehiculosFiltrada);
    } else {
      this.gridApiVehi.setRowData(this.lstVehiculos);
    }
  }

  handleSeleccionVehiculo() {
    if (this.gridApiVehi.getSelectedRows().length > 0) {
      this.gridApiVehi.getSelectedRows()[0].id;
      this.$emit(
        'vehiculoSeleccionado',
        this.gridApiVehi.getSelectedRows()[0].id
      );
    } else {
      this.$emit('vehiculoSeleccionado', 0);
    }
  }

  @Watch('modoVer', { deep: true, immediate: true })
  handleTipoMantenimientoSeleccionadoChange() {
    if (this.modoVer) {
      this.radiosVF = 'rdbVehiculos';
      this.selectedRB('rdbVehiculos');
    } else {
      this.radiosVF = 'rdbFlota';
      this.selectedRB('rdbFlota');
    }
  }
}
</script>

<style scoped>
h2 {
  font-weight: normal;
  margin-top: 12px !important;
}
</style>
