<template>
  <v-container fluid grid-list-md>
    <h2>Dashboard</h2>
    <v-dialog v-if="showInfoDialog" v-model="showInfoDialog" width="500">
      <v-card max-width="450" class="mx-auto">
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Ver Detalle {{ vehiculoSelected.patente_vehiculo }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-icon @click="showInfoDialog = false">close</v-icon>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line>
          <template>
            <v-subheader>{{ vehiculoSelected.avl }}</v-subheader>

            <v-divider />

            <v-list-item style="margin-left: 50px;">
              <v-list-item-content>
                <v-list-item-title
                  v-text="`Estado: `"
                  style="position: absolute; margin-top: 2%;"
                ></v-list-item-title>
                <v-icon
                  :class="vehiculoSelected.activo ? 'green--text' : 'red--text'"
                  style="font-size: xx-large;position: absolute;margin-left: 50px;margin-top: 2px;"
                >
                  local_shipping
                </v-icon>
              </v-list-item-content>
            </v-list-item>
            <br />
            <br />
            <v-list-item style="margin-left: 50px;">
              <v-list-item-content>
                <v-list-item-title
                  v-text="`Fecha Última Actividad: `"
                ></v-list-item-title>
                <v-list-item-subtitle
                  v-html="
                    `<span class='text--primary'>${
                      vehiculoSelected.fecha_actividad === null
                        ? 'Sin transmisión'
                        : vehiculoSelected.fecha_actividad
                    }</span>`
                  "
                ></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <br />
            <br />
            <v-card-actions class="px-4 pb-4" center>
              <v-flex text-xs-center>
                <v-btn
                  class="button-dialog"
                  :color="vehiculoSelected.color"
                  @click="
                    goPatente(
                      vehiculoSelected.patente_vehiculo
                        ? `/Torre-Control/dispositivos/${vehiculoSelected.avl}/${vehiculoSelected.patente_vehiculo}`
                        : ''
                    )
                  "
                >
                  <v-icon dark left>devices_other</v-icon>
                  <span>Ver Dispositivos</span>
                </v-btn>
              </v-flex>
            </v-card-actions>
            <v-divider />
          </template>
        </v-list>
      </v-card>
    </v-dialog>
    <v-tabs left color="transparent">
      <v-tab @click="selectMap">Mapa de Flotas</v-tab>
      <v-tab @click="selectDatatable">Tabla de Flotas</v-tab>
    </v-tabs>
    <v-divider />
    <br />
    <v-layout row wrap align-center v-if="tabSelected == 0">
      <v-flex xs12 md6 lg2>
        <v-text-field
          @input="onInputFilter"
          v-model="patente"
          label="Patente"
        />
      </v-flex>
      <v-flex xs12 md6 lg2>
        <v-btn flat icon small @click="onChangeFilter">
          <v-icon>search</v-icon>
        </v-btn>
        <v-btn flat icon small @click="clearFilters(false)">
          <v-icon>clear</v-icon>
        </v-btn>
      </v-flex>
      <v-card
        class="no-bg"
        color="rgb(250 250 250)"
        dark
        style="margin-left: auto !important;"
      >
        <v-card-title>
          <i
            class="material-icons"
            style="width: 20px; height: 20px; margin-top: 10px; border-radius: 50%; background: rgb(38 255 38);"
          />:
          <span
            class="text-h5"
            style="color: #808080; font-size: 18px; margin-top: 10px; margin-right: 10px;"
          >
            Positivo
          </span>
          <i
            class="material-icons"
            style="width: 20px; height: 20px; margin-top: 10px; border-radius: 50%; background: #FFF226; margin-right: 10px;"
          />:
          <span
            class="text-h5"
            style="color: #808080; font-size: 18px; margin-top: 10px; margin-right: 10px;"
          >
            Preventivo
          </span>
          <i
            class="material-icons"
            style="width: 20px; height: 20px; margin-top: 10px; border-radius: 50%; background: rgb(255 72 72); margin-right: 10px;"
          />:
          <span
            class="text-h5"
            style="color: #808080; font-size: 18px; margin-top: 10px; margin-right: 10px;"
          >
            Negativo
          </span>
          <i
            class="material-icons"
            style="width: 20px; height: 20px; margin-top: 10px; border-radius: 50%; background: silver; margin-right: 10px;"
          />:
          <span
            class="text-h5"
            style="color: #808080; font-size: 18px; margin-top: 10px; margin-right: 10px;"
          >
            Desconectado
          </span>
        </v-card-title>
      </v-card>
    </v-layout>
    <v-layout v-if="tabSelected == 1">
      <span
        class="text-h5"
        style="color: #808080; font-size: 18px; margin-top: 10px; margin-right: 10px;"
      >
        * Seleccione la flota para ver el listado de vehículos <br />
        * NT = No Transmisión
      </span>
    </v-layout>
    <searchSimple v-if="tabSelected == 1" />
    <v-card>
      <FlotasCarousel v-if="tabSelected == 0" :elementos="dataTable" />
      <div
        class="right"
        style="display: flex; margin-top: -50px;"
        v-if="tabSelected == 1"
      >
        <v-btn
          id="btnExportCsv"
          flat
          small
          color="primary"
          @click="onBtnExport"
        >
          <v-icon class="importExportBtnIcon">cloud_download </v-icon
          >&nbsp;&nbsp;
          <span class="importExportBtnTexto">Exportar</span>
        </v-btn>
      </div>
      <Datatables
        v-if="tabSelected == 1"
        :headers="headers"
        :dataTable="dataTable"
      />
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { MSResponse } from '@/interfaces/MS';
import FlotasMap from '@/pantallas/TorreControl/ControlFlotas/FlotasMap.vue';
import FlotasCarousel from '@/pantallas/TorreControl/ControlFlotas/FlotasCarousel.vue';
import Datatables from '@/pantallas/TorreControl/Datatables.vue';
import { FlotaService } from '@/pantallas/TorreControl/ControlFlotas/flotaService';
import { ControlFlotasInterface } from '@/pantallas/TorreControl/ControlFlotas/controlFlotasInterface';
import { headers } from '@/pantallas/TorreControl/ControlFlotas/controlFlotasHeaders';
import { AxiosResponse } from 'axios';
import { ClientFilterI } from '@/interfaces/Filters';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';
import searchSimple from '@/pantallas/TorreControl/searchSimple.vue';

@Component({
  name: 'ControlFlotas',
  components: {
    FlotasCarousel,
    Datatables,
    FlotasMap,
    searchSimple,
  },
})
export default class ControlFlotas extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  tabSelected: any = 0;
  flotaService = new FlotaService();
  clientId: string;
  isLoading: boolean = false;
  readonly funcionalidad: Funcionalidades = Funcionalidades.TorreControl;
  dataTable: ControlFlotasInterface[] = [];
  headers = headers;
  client: ClientFilterI = { id: '', nombre: '', rut: '' };
  patente: string = '';
  vehiculoSelected: any = {};
  showInfoDialog: boolean = false;
  intervalo: any;

  constructor() {
    super();
    this.getClientId();
  }

  beforeDestroy() {
    TorreControlInstance.$off('changeSlide');
    TorreControlInstance.$off('vehiculoSelected');
  }

  mounted() {
    let self = this;
    this.getFlota(false).finally(() => {
      self.loadingService.hideLoading();
    });
    TorreControlInstance.$on('changeSlide', () => {
      this.clearFilters();
    });
    TorreControlInstance.$on('vehiculoSelected', (selection: any) => {
      this.vehiculoSelected = selection;
      this.showInfoDialog = true;
    });
  }

  async getFlota(sumary: boolean) {
    let self = this;
    this.dataTable = [];
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<ControlFlotasInterface>
    > = await this.flotaService.getFlotas(this.clientId, sumary);
    this.isLoading = false;
    const msRespose: MSResponse<ControlFlotasInterface> = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA === '1') {
      msRespose.data.forEach(item => {
        if (self.dataTable.length == 0) {
          self.dataTable.push(item);
        } else {
          if (!self.dataTable.find(obj => obj.cod_flota === item.cod_flota))
            self.dataTable.push(item);
        }
      });
      TorreControlInstance.$emit('dataTable', this.dataTable);
    } else {
      this.dataTable = [];
    }
    // this.loadingService.hideLoading();
  }

  onInputFilter() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.patente.length >= 3) {
        TorreControlInstance.$emit('searchPatente', self.patente, true);
      } else if (self.patente.length < 3) {
        TorreControlInstance.$emit('searchPatente', self.patente, true);
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  getClientId() {
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  selectMap() {
    let self = this;
    this.tabSelected = 0;
    this.getFlota(false).finally(() => {
      self.loadingService.hideLoading();
    });
  }

  selectDatatable() {
    let self = this;
    this.tabSelected = 1;
    this.getFlota(true).finally(() => {
      self.loadingService.hideLoading();
    });
  }

  clearFilters(flag = true) {
    this.client = { id: '', nombre: '', rut: '' };
    this.patente = '';
    if (!flag) {
      this.onInputFilter();
    } else {
      TorreControlInstance.$emit('searchPatente', this.patente, false);
    }
  }

  onChangeFilter() {
    TorreControlInstance.$emit('searchPatente', this.patente, false);
  }

  goPatente(uri: string) {
    if (uri) {
      this.$router.push(uri);
    } else {
      this.$snotify.warning('Vehículo sin Patente');
    }
  }

  onBtnExport() {
    TorreControlInstance.$emit('exportFlota');
  }
}
</script>

<style scoped>
.no-bg {
  -webkit-box-shadow: none !important;
}
</style>
