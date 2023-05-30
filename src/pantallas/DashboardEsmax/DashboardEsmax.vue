<template>
  <v-layout>
    <v-container fluid grid-list-xl>
      <v-tabs left color="transparent" class="mb-9">
        <v-tab @click="selectEstadoDispositivo">Estado Dispositivos</v-tab>
        <v-tab @click="selectRanking">Ranking Conductores</v-tab>
        <v-tab @click="selectSellos">Sellos</v-tab>
        <v-tab @click="selectAlertas">Alertas</v-tab>
        <!-- <v-tab @click="selectTiempoEstadia">Tiempo Estadia </v-tab> -->
        <v-tab @click="selectDetencionNoAutorizada"
          >Detención No Autorizada
        </v-tab>
      </v-tabs>
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
      <v-container fluid grid-list-xl class="my-9" v-show="!cargando">
        <Filtros />
      </v-container>
    </v-container>
  </v-layout>
</template>

<script lang="ts">
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Component } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import Filtros from '@/components/dashboardEsmax/Filtros.vue';
import { esmaxDashboardEventBus } from '@/setup';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import { fetchDashboardA } from '@/pantallas/Dashboard/fetchDashboardA';

@Component({
  components: {
    Filtros,
  },
})
export default class DashboardEsmax extends ComponenteBase {
  tabSelected: number = 0;
  filtros: any = [];
  cargando: boolean = false;
  $snotify: any;

  constructor() {
    super();
  }

  seleccion: number = 0;

  readonly funcionalidad: Funcionalidades = Funcionalidades.DashboardEsmax;

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [this.accionCrear];

  async created() {
    this.tabSelected = 0;
    let urlFiltros = 'dashboard_esmax/estado_dispositivos_filtros';
    let bodyConsulta = { user_id: 368, id_cliente: this.clienteId };
    await fetchDashboardA(bodyConsulta, urlFiltros)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.filtros = response.data.filtros;
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
    esmaxDashboardEventBus.$emit('resetGrid');
    esmaxDashboardEventBus.$emit('filtro', this.filtros, this.tabSelected);
  }
  async selectEstadoDispositivo() {
    this.tabSelected = 0;
    let urlFiltros = 'dashboard_esmax/estado_dispositivos_filtros';
    this.getFiltros(urlFiltros);
  }
  async selectRanking() {
    this.tabSelected = 1;
    let urlFiltros = 'dashboard_esmax/ranking_conductores_filtros';
    this.getFiltros(urlFiltros);
  }
  async selectSellos() {
    this.tabSelected = 2;
    let urlFiltros = 'dashboard_esmax/informe_sellos_filtros';
    this.getFiltros(urlFiltros);
  }
  async selectAlertas() {
    this.tabSelected = 3;
    let urlFiltros = 'dashboard_esmax/alertas_filtros';
    this.getFiltros(urlFiltros);
  }
  async selectTiempoEstadia() {
    this.tabSelected = 4;
    let urlFiltros = 'dashboard_esmax/tiempo_estadia_filtros';
    this.getFiltros(urlFiltros);
  }
  async selectDetencionNoAutorizada() {
    this.tabSelected = 5;
    let urlFiltros = 'dashboard_esmax/detencion_no_autorizada_filtros';
    this.getFiltros(urlFiltros);
  }
  async getFiltros(urlFiltros: any) {
    this.cargando = true;
    console.log('Entro!!');
    let bodyConsulta = { user_id: 368, id_cliente: this.clienteId };
    await fetchDashboardA(bodyConsulta, urlFiltros)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.filtros = response.data.filtros;
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
    esmaxDashboardEventBus.$emit('filtro', this.filtros, this.tabSelected);
  }
}
</script>
