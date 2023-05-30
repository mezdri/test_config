<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="closeModal(false)">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Vehículos de Flota</v-toolbar-title>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div class="cardnew">
          <br />
          <div align="center">
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md text-xs-center>
                  <v-layout row wrap>
                    <div align="left">
                      <v-flex md12>
                        <h2 class="h2_title">Vehículos Asociados</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px;font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefs"
                          :rowData="vehiculosRespaldo"
                          rowSelection="multiple"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :gridReady="onGridReady"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { FlotaInterface } from '@/interfaces/Flota';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { eventBus } from '@/setup';
import { GridApi, ColumnApi, ColDef, GridReadyEvent } from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class VehiculosCompartidos extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ id: 0, nombre: '', estado: 1 }) })
  flota!: FlotaInterface;

  //Variables globales
  controllerFlota: string = 'flota';
  controllerGpsVehiculo: string = 'gpsvehiculo';
  localeText = config.agGridTextos;
  $snotify: any;
  dialog: boolean = false;
  dictionaryFormErrors: any = {};
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  vehiculosAsignadosModel: any = [];
  handleErrors: HandleErrors = new HandleErrors();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosGps: AxiosVue = new AxiosVue(ServicioProxy.Gps);

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;

  mounted() {
    this.initialize();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.vehiculosAsignados = [];
    this.vehiculosRespaldo = [];
    this.vehiculosAsignadosModel = [];

    if (value) {
      this.getVehiculosFlota();
    }
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  getVehiculosFlota() {
    this.axios.http
      .get(`${this.controllerFlota}/${this.flota.id}/vehiculo`)
      .then(res => {
        let vehiculos: any = [];
        res.data.forEach((element: any) => {
          vehiculos.push({
            Id: 0,
            VehiculoId: element.id,
            GpsId: 0,
            UsuarioInstalacionId: 0,
          });
        });

        this.axiosGps.http
          .post(`${this.controllerGpsVehiculo}/getGpsSimVehiculos`, vehiculos)
          .then(resGps => {
            res.data.forEach((element: any) => {
              let data = resGps.data.filter(
                (x: any) => x.idVehiculo === element.id
              );
              if (data.length > 0) {
                element.sim = data[0].sim;
                element.gps = data[0].gps;
              }
            });

            this.vehiculosRespaldo = res.data;
          })
          .catch(error => {
            this.$snotify.error(
              'Ocurrió un error al obtener los vehículos de la flota.'
            );
          });
      })
      .catch(error => {
        this.$snotify.error(
          'Ocurrió un error al obtener los vehículos de la flota.'
        );
      });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  initialize() {
    this.columnDefs = [
      {
        headerName: 'Vehículo',
        width: 130,
        field: 'patente',
        resizable: true,
        sortable: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo de Vehículo',
        width: 200,
        field: 'vehiculoTipo.nombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'IMEI',
        width: 200,
        minWidth: 80,
        field: 'gps.imei',
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Marca GPS',
        width: 200,
        minWidth: 80,
        field: 'gps.marca',
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Modelo GPS',
        width: 200,
        minWidth: 80,
        field: 'gps.modelo',
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nro. Serie GPS',
        width: 200,
        minWidth: 80,
        field: 'gps.numeroSerie',
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nro. SIM',
        width: 200,
        minWidth: 80,
        field: 'sim.numeroSIM',
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
