<template>
  <div>
    <v-layout row wrap class="mx-3" align="center" v-show="permisoDenegado">
      <v-flex xs12 align="center">
        <form @submit.prevent="submit()">
          <!-- v-slot="{ errors }" -->
          <div id="gridPrincipal">
            <div id="subgridA">
              <div v-for="filtro in filtros.filtros" :key="filtro.cod">
                <!-- v-validate="'required'" -->
                <v-autocomplete
                  class=""
                  v-if="filtro.tipo.toLowerCase() === 'dropdown'"
                  v-model="esquema.estructura[filtro.cod]"
                  :data-vv-name="filtro.cod"
                  :label="filtro.name"
                  :items="filtro.data"
                  item-text="desc"
                  item-value="cod"
                  :error-messages="errors.collect(filtro.cod)"
                  @change="changeFiltro($event, filtro)"
                  :multiple="getMultiple(filtro)"
                  :menu-props="{ closeOnContentClick: true }"
                >
                  <!-- multiple -->
                  <template v-slot:prepend-item v-if="getMultiple(filtro)">
                    <!-- v-model="checkAll" -->
                    <v-list-tile
                      ><v-checkbox
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
                      <!-- <span>{{ this.esquema.estructura[filtro.cod] }}</span> -->
                      <span>{{ item.desc }}</span>
                    </v-chip>
                    <span v-if="index === 1" class="grey--text caption"
                      >(+{{ printCantidadSeleccion(filtro) }} otros)</span
                    >
                  </template>
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
          <v-progress-linear
            indeterminate
            color="primary"
            v-show="cargando"
          ></v-progress-linear>
          <br />
          <br />
          <GraficosGrid />
        </v-container>
        <v-layout>
          <v-dialog v-model="dateStartDialog" max-width="290">
            <!-- @change="dateSeleccionIni($event)" -->
            <v-date-picker
              v-model="esquema.estructura.fini"
              range
              event-color="#27488E"
            ></v-date-picker>
          </v-dialog>
          <v-dialog v-model="dateEndDialog" max-width="290">
            <!-- @change="dateSeleccionFin($event, item)" -->
            <v-date-picker
              v-model="esquema.estructura.ffin"
              range
              event-color="#27488E"
              :min="esquema.estructura.fini"
            ></v-date-picker>
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
import { SellosClass } from '@/interfaces/DashboardEsmax/SellosClass';
import GraficosGrid from './GraficosGrid.vue';
import { esmaxDashboardEventBus } from '@/setup';
import { date } from 'yup';

@Component({
  components: {
    ValidationObserver,
    ValidationProvider,
    GraficosGrid,
  },
})
export default class EstadoDispositivos extends Vue {
  @Prop(String) readonly dash: string;
  @Prop(Number) readonly seleccionTab: Number;

  $snotify: any;
  userId: number = null;
  clientId: number = null;
  dateCodSelected: string = '';
  filtros: any = [];
  data: any = [];
  dateEndDialog: Boolean = false;
  checkAll: any = {};
  dateStartDialog: Boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dictionaryFormErrors: any = {};
  dateStartSelected: any = null;
  dateEndSelected: any = null;
  estadoDispositivos = new EstadoDispositivosClass().estado;
  estadoRanking = new RankingClass().estado;
  tiempoEstadia = new TiempoEstadiaClass().estado;
  estadoSellos = new SellosClass().estado;
  esquema = new EsquemaDashboard().esquema;
  cargando = false;
  permisoDenegado = false;

  // dateSeleccionIni(event: any) {
  //   this.esquema.estructura.fini = event;
  //   this.dateStartSelected = event;
  //   this.dateCodSelected = '';
  //   this.dateStartDialog = false;
  // }
  // dateSeleccionFin(event: any) {
  //   this.esquema.estructura.ffin = event;
  //   this.dateEndSelected = event;
  //   this.dateCodSelected = '';
  //   this.dateEndDialog = false;
  // }
  getMultiple(filtro: any) {
    return filtro.data.length > 1 && filtro.cod != 'alerta';
  }
  selectAll(filtro: any) {
    if (this.checkAll[filtro.cod] == false) {
      this.checkAll[filtro.cod] = true;
      let result: any = [];
      filtro.data.map((element: any) => {
        result = [...result, element.cod];
        element.cod;
      });
      this.esquema.estructura[filtro.cod] = result;
    } else {
      this.esquema.estructura[filtro.cod] = [];
      this.checkAll[filtro.cod] = false;
    }
    //! es por que entra al changue filtro
    return true;
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

  printCantidadSeleccion(filtro: any) {
    let result = this.esquema.seleccion.find(iter => iter.cod == filtro.cod);
    return result.items;
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response;
  }
  async submit() {
    console.log(this.esquema.estructura, this.esquema.urlDashboard);
    esmaxDashboardEventBus.$emit('resetGrid');
    let result = await this.validar();
    if (result) {
      this.cargando = true;

      // this.data = await fetchDashboard(
      //   this.esquema.estructura,
      //   this.esquema.urlDashboard
      // );
      console.log(this.esquema);
      await fetchDashboard(this.esquema.estructura, this.esquema.urlDashboard)
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
          this.cargando = false;
        });

      // console.log(this.data);
      this.filtros.CODIGO_RESPUESTA == 1
        ? (esmaxDashboardEventBus.$emit('dataReady', this.data),
          (this.cargando = false))
        : this.$snotify.error('No existen datos para esta consulta');
    }
  }
  async validar() {
    return await this.$validator.validateAll();
  }
  async mounted() {
    console.log(this.seleccionTab);
    this.dictionaryFormErrors = {
      custom: {},
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    let currentDate = new Date();
    let cDay = currentDate.getDate();
    let cMonth = currentDate.getMonth() + 1;
    let cYear = currentDate.getFullYear();
    let datedefault = cYear + '-' + cMonth + '-' + cDay;
    esmaxDashboardEventBus.$on('seleccionTab', (seleccion: any) => {
      switch (seleccion) {
        case 0:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros =
            'dashboard_esmax/estado_dispositivos_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/estado_dispositivos';
          this.esquema.estructura = this.estadoDispositivos;
          this.esquema.label = 'Estado Dispositivos';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;

        case 1:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros =
            'dashboard_esmax/ranking_conductores_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/ranking_conductores';
          this.esquema.estructura = this.estadoRanking;
          this.esquema.label = 'Ranking de Conductores';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;

        case 2:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros = 'dashboard_esmax/informe_sellos_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/informe_sellos';
          this.esquema.estructura = this.estadoSellos;
          this.esquema.label = 'Sellos';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;

        case 3:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros = 'dashboard_esmax/alertas_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/alertas';
          this.esquema.estructura = this.estadoSellos;
          this.esquema.label = 'Alertas';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;

        case 4:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros = 'dashboard_esmax/tiempo_estadia_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/tiempo_estadia';
          this.esquema.estructura = this.tiempoEstadia;
          this.esquema.label = 'Tiempo de Estadia';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;

        case 5:
          this.esquema.cod = this.dash;
          this.esquema.urlFiltros =
            'dashboard_esmax/detencion_no_autorizada_filtros';
          this.esquema.urlDashboard = 'dashboard_esmax/detencion_no_autorizada';
          this.esquema.estructura = this.estadoSellos;
          this.esquema.label = 'Detección No Autorizada';
          this.esquema.estructura.fini = datedefault;
          this.esquema.estructura.ffin = datedefault;
          break;
      }
      this.submit();
    });
    switch (this.dash) {
      case 'EstadoDispositivos':
        this.esquema.cod = this.dash;
        this.esquema.urlFiltros = 'dashboard_esmax/estado_dispositivos_filtros';
        this.esquema.urlDashboard = 'dashboard_esmax/estado_dispositivos';
        this.esquema.estructura = this.estadoDispositivos;
        this.esquema.label = 'Estado Dispositivos';
        this.esquema.estructura.fini = datedefault;
        this.esquema.estructura.ffin = datedefault;
        this.submit();
        break;

      case 'Ranking':
        this.esquema.cod = this.dash;
        this.esquema.urlFiltros = 'dashboard_esmax/ranking_conductores_filtros';
        this.esquema.urlDashboard = 'dashboard_esmax/ranking_conductores';
        this.esquema.estructura = this.estadoRanking;
        this.esquema.label = 'Ranking de Conductores';
        this.esquema.estructura.fini = datedefault;
        this.esquema.estructura.ffin = datedefault;
        break;

      case 'Sellos':
        this.esquema.cod = this.dash;
        this.esquema.urlFiltros = 'dashboard_esmax/informe_sellos_filtros';
        this.esquema.urlDashboard = 'dashboard_esmax/informe_sellos';
        this.esquema.estructura = this.estadoSellos;
        this.esquema.label = 'Sellos';
        this.esquema.estructura.fini = datedefault;
        this.esquema.estructura.ffin = datedefault;
        break;
    }

    this.userId = store.state.userId;
    this.clientId = parseInt(localStorage.getItem('clienteDefecto'));

    let body = { user_id: 368, id_cliente: this.clientId };
    this.esquema.estructura.user_id = 368;
    this.esquema.estructura.id_cliente = this.clientId;
    let bodyConsulta = { user_id: 368, id_cliente: this.clientId };
    let uri = this.esquema.urlFiltros;
    await fetchDashboard(bodyConsulta, uri)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.filtros = response.data;
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
        this.cargando = false;
      });
    //this.filtros = await fetchDashboard(bodyConsulta, uri);
    this.filtros = this.filtros.data;
    this.filtros.filtros.map((filtro: any) => {
      this.checkAll[filtro.cod] = false;
    });
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
