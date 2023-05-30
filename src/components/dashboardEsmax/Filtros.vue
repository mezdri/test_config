<template>
  <div>
    <v-layout row wrap class="mx-3" align="center">
      <v-flex xs12 align="center">
        <div
          style="width: 100%; display: flex; align-items: center; justify-content: center;"
          v-show="cargando"
        >
          <h3 style="font-size: 1.6vmin; font-weight: 400;">
            Se está cargando la información, espere unos segundos...
          </h3>
        </div>
        <v-progress-linear
          indeterminate
          color="primary"
          v-show="cargando"
        ></v-progress-linear>
        <form @submit.prevent="submit()">
          <!-- v-slot="{ errors }" -->
          <div id="gridPrincipal">
            <div id="subgridA">
              <div v-for="filtro in filtros" :key="filtro.cod">
                <v-autocomplete
                  class=""
                  v-model="esquema.estructura[filtro.cod]"
                  v-if="filtro.tipo.toLowerCase() === 'dropdown'"
                  @change="changeFiltro($event, filtro)"
                  :data-vv-name="filtro.cod"
                  :label="filtro.name"
                  :items="filtro.data"
                  item-text="desc"
                  item-value="cod"
                  :error-messages="errors.collect(filtro.cod)"
                  :multiple="getMultiple(filtro)"
                  :menu-props="{ closeOnContentClick: true }"
                >
                  <template v-slot:prepend-item v-if="getMultiple(filtro)">
                    <!-- v-model="checkAll" -->
                    <v-list-tile
                      ><v-checkbox
                        v-model="checkAll[filtro.cod]"
                        label="Seleccionar todos"
                        @change="selectAll(filtro)"
                      ></v-checkbox
                    ></v-list-tile>
                    <v-divider></v-divider>
                  </template>

                  <template v-slot:selection="{ item, index }">
                    <v-chip v-if="index < 1 && !checkAll[filtro.cod]">
                      <span>{{ item.desc }}</span>
                    </v-chip>
                    <v-chip
                      v-if="index >= 1 && index < 2 && !checkAll[filtro.cod]"
                    >
                      ...
                    </v-chip>
                    <v-chip v-if="index < 1 && checkAll[filtro.cod]">
                      Todo
                    </v-chip>
                  </template>
                  <template v-slot:seleccion="{ item, index }">
                    <v-chip v-if="index === 0">
                      <span>{{ this.esquema.estructura[filtro.cod] }}</span>
                      <span>{{ item.desc }}</span>
                    </v-chip>
                    <span v-if="index === 1" class="grey--text caption"
                      >(+{{ printCantidadSeleccion(filtro) }} otros)</span
                    >
                  </template>
                  <!-- @change="changeFiltro($event, filtro)"
                  :multiple="getMultiple(filtro)" -->
                </v-autocomplete>
                <div
                  @click="getDataPiker(filtro.cod)"
                  v-if="filtro.tipo === 'date' && filtro.cod == 'fini'"
                  class="ma-6"
                  required
                >
                  <v-combobox
                    v-validate="'required'"
                    :data-vv-name="filtro.cod"
                    v-model="esquema.estructura[filtro.cod]"
                    :error-messages="errors.collect(filtro.cod)"
                    :label="filtro.name"
                    prepend-icon="event"
                    required
                    chips
                    readonly
                    deletable-chips
                  >
                  </v-combobox>
                </div>
                <div
                  @click="getDataPiker(filtro.cod)"
                  v-if="filtro.tipo === 'date' && filtro.cod == 'ffin'"
                  class="ma-6"
                  required
                >
                  <v-combobox
                    v-validate="'required'"
                    :data-vv-name="filtro.cod"
                    :error-messages="errors.collect(filtro.cod)"
                    v-model="esquema.estructura[filtro.cod]"
                    :label="filtro.name"
                    prepend-icon="event"
                    required
                    chips
                    readonly
                    deletable-chips
                  >
                  </v-combobox>
                </div>
              </div>
            </div>
            <div class="subgridB">
              <v-btn color="#27488E" fab small dark type="submit">
                <v-icon>search</v-icon>
              </v-btn>
            </div>
          </div>
        </form>
      </v-flex>
      <br />
      <br />
    </v-layout>
    <v-card>
      <v-layout>
        <v-container grid-list-xl fluid>
          <v-layout row wrap class="mb-4">
            <div align="left">
              <v-flex md12>
                <h2 class="h2_title">{{ esquema.label }}</h2>
              </v-flex>
            </div>
          </v-layout>
          <v-divider></v-divider>
          <div
            style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 5px;"
            v-show="cargandoDash"
          >
            <h3 style="font-size: 1.6vmin; font-weight: 400;">
              Se está cargando la información, espere unos segundos...
            </h3>
          </div>
          <v-progress-linear
            indeterminate
            color="primary"
            v-show="cargandoDash"
          ></v-progress-linear>
          <br />
          <br />
          <GraficosGrid />
        </v-container>
        <v-layout>
          <v-dialog v-model="dateStartDialog" max-width="290">
            <v-card>
              <!-- @change="dateSeleccionIni($event)" -->
              <v-date-picker
                v-model="fechaini"
                range
                event-color="#27488E"
                @change="changedatetimeini"
              ></v-date-picker>
              <v-text-field
                type="time"
                prepend-icon="access_time"
                label="Hora desde"
                v-model="hourini"
                background-color="white"
                @change="changedatetimeini"
              />
            </v-card>
          </v-dialog>
          <v-dialog v-model="dateEndDialog" max-width="290">
            <!-- @change="dateSeleccionFin($event, item)" -->
            <v-date-picker
              v-model="fechafin"
              range
              event-color="#27488E"
              :min="fechaini"
              @change="changedatetimefin"
            ></v-date-picker>
            <v-text-field
              type="time"
              prepend-icon="access_time"
              label="Hora fin"
              v-model="hourfin"
              background-color="white"
              @change="changedatetimefin"
            />
            <!-- :events="dateStartArray" -->
            <!-- :allowed-dates="allowedDates" -->
          </v-dialog>
        </v-layout>
      </v-layout>
    </v-card>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { fetchDashboardA } from '@/pantallas/Dashboard/fetchDashboardA';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import HandleErrors from '@/config/handleErrors';
import { ValidationObserver, ValidationProvider } from 'vee-validate';
import store from '@/store';
import {
  EstadoDispositivosClass,
  IEstadoDisp,
} from '@/interfaces/DashboardEsmax/EstadoDispositivosClass';
import { RankingClass } from '@/interfaces/DashboardEsmax/RankingClass';
import { TiempoEstadiaClass } from '@/interfaces/DashboardEsmax/TiempoEstadiaClass';
import { EsquemaDashboard } from '@/interfaces/DashboardEsmax/EsquemaDashboard';
import { AlertasClass } from '@/interfaces/DashboardEsmax/AlertasClass';
import { SellosClass } from '@/interfaces/DashboardEsmax/SellosClass';
import { DeteccionNoAutorizadaClass } from '@/interfaces/DashboardEsmax/DeteccionNoAutorizadaClass';
import GraficosGrid from './GraficosGrid.vue';
import { esmaxDashboardEventBus } from '@/setup';
import { date } from 'yup';
import moment from 'moment';

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
    GraficosGrid,
  },
})
export default class Filtros extends Vue {
  filtros: any = [];
  cargando: boolean = true;
  cargandoDash: boolean = false;
  $snotify: any;
  userId: number = null;
  clientId: number = null;
  dateCodSelected: string = '';
  data: any = [];
  dateEndDialog: Boolean = false;
  checkAll: any = {};
  dateStartDialog: Boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dictionaryFormErrors: any = {};
  dateStartSelected: any = null;
  fechaini: any = this.formatDate();
  fechafin: any = this.formatDate();

  hourini: any = moment()
    .hour(0)
    .minute(0)
    .second(0)
    .format('HH:mm:ss');
  hourfin: any = moment()
    .utc()
    .hour(23)
    .minute(59)
    .second(59)
    .toISOString()
    .substr(11, 8);
  dateEndSelected: any = null;
  estadoDispositivos = new EstadoDispositivosClass().estado;
  estadoRanking = new RankingClass().estado;
  estadoSellos = new SellosClass().estado;
  esquema = new EsquemaDashboard().esquema;
  esquemabackend = new EsquemaDashboard().esquema.estructura;
  tiempoEstadia = new TiempoEstadiaClass().estado;
  alertas = new AlertasClass().estado;
  detencionNoAutorizada = new DeteccionNoAutorizadaClass().estado;
  permisoDenegado = false;

  changedatetimeini(val: any) {
    this.esquema.estructura.fini = this.fechaini + ' ' + this.hourini;
  }
  changedatetimefin(val: any) {
    this.esquema.estructura.ffin = this.fechafin + ' ' + this.hourfin;
  }

  formatDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  async mounted() {
    this.dictionaryFormErrors = {
      custom: {},
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    let currentDate = new Date();
    let cDay = currentDate.getDate();
    let cMonth = currentDate.getMonth() + 1;
    let cYear = currentDate.getFullYear();
    let datedefault = cYear + '-' + cMonth + '-' + cDay;

    esmaxDashboardEventBus.$on('filtro', (filtros: any, seleccion: any) => {
      this.cargando = true;
      this.filtros = filtros;
      if (this.filtros) {
        this.cargando = false;
      }
      switch (seleccion) {
        case 0:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros =
            'dashboard_esmax/estado_dispositivos_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/estado_dispositivos';
          this.esquema.estructura = this.estadoDispositivos;
          this.esquema.label = 'Estado Dispositivos';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;

        case 1:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros =
            'dashboard_esmax/ranking_conductores_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/ranking_conductores';
          this.esquema.estructura = this.estadoRanking;
          this.esquema.label = 'Ranking de Conductores';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;

        case 2:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros = 'dashboard_esmax/informe_sellos_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/informe_sellos';
          this.esquema.estructura = this.estadoSellos;
          this.esquema.label = 'Sellos';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;
        case 3:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros = 'dashboard_esmax/alertas_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/alertas';
          this.esquema.estructura = this.alertas;
          this.esquema.label = 'Alertas';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;

        case 4:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros = 'dashboard_esmax/tiempo_estadia_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/tiempo_estadia';
          this.esquema.estructura = this.tiempoEstadia;
          this.esquema.label = 'Tiempo de Estadia';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;

        case 5:
          this.esquema.cod = seleccion;
          this.esquema.urlFiltros =
            'dashboard_esmax/detencion_no_autorizada_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/detencion_no_autorizada';
          this.esquema.estructura = this.detencionNoAutorizada;
          this.esquema.label = 'Detección No Autorizada';
          this.esquema.estructura.fini = datedefault + ' ' + this.hourini;
          this.esquema.estructura.ffin = datedefault + ' ' + this.hourfin;
          break;
      }
      this.filtros.map(async (filtro: any) => {
        this.checkAll[filtro.cod] = true;

        if (this.getMultiple(filtro)) {
          await this.selectAll(filtro);
        }
      });
      this.submit();
    });
    this.userId = store.state.userId;
    this.clientId = parseInt(localStorage.getItem('clienteDefecto'));
  }
  getDataPiker(cod: any) {
    this.dateCodSelected = cod;
    if (this.dateCodSelected == 'fini') {
      this.dateStartDialog = true;
    }
    if (this.dateCodSelected == 'ffin') {
      this.dateEndDialog = true;
    }
  }
  getMultiple(filtro: any) {
    return filtro.tipo == 'dropdown';
  }

  get fechaMinima() {
    let fechaMin = moment(this.esquema.estructura.fini).format('l');
    return fechaMin;
  }
  changeFiltro(item: any, filtro: any) {
    const seleccion = { cod: filtro.cod, items: item.length - 1 };
    let finded = false;

    this.esquema.seleccion.forEach((select, index) => {
      if (select.cod == filtro.cod) {
        this.esquema.seleccion[index] = seleccion;
        finded = true;
      }
    });
    if (!finded)
      this.esquema.seleccion = [...this.esquema.seleccion, seleccion];
    if (this.esquema.estructura[filtro.cod].length != filtro.data.length) {
      this.checkAll[filtro.cod] = false;
    }
  }
  selectAll(filtro: any) {
    if (this.checkAll[filtro.cod] == true) {
      // this.checkAll[filtro.cod] = true;
      let result: any = [];
      filtro.data.map((element: any) => {
        result = [...result, element.cod];
        element.cod;
      });
      this.esquema.estructura[filtro.cod] = result;
      this.esquemabackend[filtro.cod] = [];
    } else {
      this.esquema.estructura[filtro.cod] = [];
      this.esquemabackend[filtro.cod] = [];
      // this.checkAll[filtro.cod] = false;
    }
    return true;
  }
  async validar() {
    return await this.$validator.validateAll();
  }

  async submit() {
    this.esquema.estructura.user_id = 368;
    this.esquema.estructura.id_cliente = this.clientId;

    var newSchema: any = JSON.parse(JSON.stringify(this.esquema.estructura));
    for (var filtro of this.filtros) {
      if (filtro.hasOwnProperty('tipo') && filtro.tipo == 'dropdown') {
        for (var att in this.esquema.estructura) {
          if (filtro.cod == att) {
            if (this.esquema.estructura[att].length == filtro.data.length) {
              newSchema[att] = [];
            }
          }
        }
      }
    }

    esmaxDashboardEventBus.$emit('resetGrid');
    let result = await this.validar();
    if (result) {
      this.cargandoDash = true;

      await fetchDashboardA(newSchema, this.esquema.urlDashboard)
        .then((response: any) => {
          if (response.data.CODIGO_RESPUESTA == '1') {
            this.data = response.data;
          } else {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
          }
        })
        .catch((error: any) => {
          console.log(error);
          this.$snotify.error('Error al traer la data. Intente de nuevo', {
            timeout: 3000,
          });
        })
        .finally(() => {
          this.cargandoDash = false;
        });

      this.data.CODIGO_RESPUESTA == 1
        ? (esmaxDashboardEventBus.$emit('dataReady', this.data),
          (this.cargandoDash = false))
        : (this.$snotify.error('No existen datos para esta consulta'),
          (this.cargandoDash = false));
    }
  }
}
</script>
<style scoped>
#gridPrincipal {
  display: grid;
  grid-template-columns: 11fr 1fr;
  grid-template-rows: 1fr;
  column-gap: 4px;
  row-gap: 2px;
  align-content: center;
  justify-content: center;
}
#subgridA {
  column-gap: 10px;
  row-gap: 5px;
  display: grid;
  grid-template-columns: repeat(4, auto);
  align-items: center;
  justify-items: center;
}
.subgridB {
  text-align: center;
  justify-content: center;
  margin: auto;
}
</style>
