<template>
  <div v-if="dataReady">
    <div id="gridPrincipal">
      <v-card
        class="elemento"
        v-for="dash in filtrarElemento(graficosData)"
        v-bind:key="dash.namekey"
      >
        <v-card elevation="2" :loading="true" class="card"
          ><v-card-title>
            <h3>
              {{ dash.name }}
            </h3>
          </v-card-title>
          <v-divider class="mx-4"></v-divider>
          <br />
          <div v-if="dash.tipo_grafico == 'barra'" class="pa-3">
            <GraficoBarra :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'barra_stacked'" class="pa-3">
            <GraficoBarraStacked :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'barra_laterial'" class="pa-3">
            <GraficoBarraLateral :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'pie'" class="pa-3">
            <GraficoPie :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'tabla'" class="pa-3">
            <GraficoGrid :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'mapa'" class="pa-3">
            <GraficoMapa :dataInicial="dash" />
          </div>
        </v-card>
      </v-card>
    </div>
    <div id="gridSecundario">
      <div
        class="elemento"
        v-for="dash in filtrarTabla(this.graficosData)"
        v-bind:key="dash.namekey"
      >
        <v-card elevation="2" :loading="true" class="card mt-3"
          ><v-card-title>
            <h3>
              {{ dash.name }}
            </h3>
          </v-card-title>
          <v-divider class="mx-4"></v-divider>
          <br />
          <div v-if="dash.tipo_grafico == 'tabla'" class="pa-3">
            <GraficoGrid :dataInicial="dash" />
          </div>
          <div v-if="dash.tipo_grafico == 'barra_lateral'" class="pa-3">
            <GraficoBarraLateralStaked :dataInicial="dash" />
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { esmaxDashboardEventBus } from '@/setup';
import { Bar, HorizontalBar, Line, Doughnut, Radar } from 'vue-chartjs';

import GraficoBarra from './TiposGraficos/GraficoBarra.vue';
import GraficoBarraLateralStaked from './TiposGraficos/GraficoBarraLateralStaked.vue';
import GraficoBarraLateral from './TiposGraficos/GraficoBarraLateral.vue';
import GraficoBarraStacked from './TiposGraficos/GraficoBarraStacked.vue';
import GraficoPie from './TiposGraficos/GraficoPie.vue';
import GraficoGrid from './TiposGraficos/GraficoGrid.vue';
import GraficoMapa from './TiposGraficos/GraficoMapa.vue';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    GraficoGrid,
    GraficoMapa,
    GraficoBarra,
    GraficoBarraStacked,
    GraficoBarraLateralStaked,
    GraficoBarraLateral,
    GraficoPie,
    'ag-grid-vue': AgGridVue,
    barComp: Bar,
    barHComp: HorizontalBar,
    lineComp: Line,
    doughnutComp: Doughnut,
    radarComp: Radar,
  },
})
export default class GraficosGrid extends Vue {
  countKey: number = 0;
  dataReady: Boolean = false;
  data: any;
  graficosData: any[] = [];
  pluginOptions: any = {
    datalabels: {
      anchor: 'end',
      align: 'end',
      padding: -3,
      labels: {
        value: {
          color: 'black',
        },
      },
    },
  };

  ortographyDict: any = {
    ULTIMA: 'ÚLTIMA',
    VEHICULO: 'VEHÍCULO',
    DETENCION: 'DETENCIÓN',
    UBICACION: 'UBICACIÓN',
  };

  get getNewKey(): string {
    this.countKey += 1;
    return this.countKey.toString();
  }
  //   @Prop({ default: {} }) readonly data: any;
  // suport [17:12] Christian Saez Peñaloza

  reset() {
    this.dataReady = false;
  }
  filtrarElemento(graficosData: any) {
    return graficosData.filter((data: any) => {
      console.log(data);
      return (
        data.tipo_grafico != 'tabla' && data.tipo_grafico != 'barra_lateral'
      );
    });
  }
  filtrarTabla(graficosData: any) {
    return graficosData.filter((data: any) => {
      return (
        data.tipo_grafico == 'tabla' || data.tipo_grafico == 'barra_lateral'
      );
    });
  }
  esStacked(dash: any) {
    return (
      dash.name == 'Ranking por Transportista' ||
      dash.name == 'Ranking por Vehículo' ||
      dash.name == 'Ranking por Conductor'
    );
  }
  noEsStacked(dash: any) {
    return (
      dash.name == 'Cantidad de Alertas por Flota' ||
      dash.name == 'Cantidad de Alertas por Grupo'
    );
  }
  getRef(aux: string) {
    let ref: any;
    ref = aux.toLowerCase();
    ref = ref.split(' ').join('_');
    return ref;
  }
  mounted() {
    esmaxDashboardEventBus.$on('dataReady', (data: any) => {
      this.data = data;
      this.dataReady = true;
      let newData: any[] = [];
      Object.values(this.data).map(function(value, index) {
        if (typeof value == 'object') {
          newData = [...newData, value];
        }
      });
      this.graficosData = newData;
      if (this.graficosData) {
        this.graficosData.map((elemento: any) => {
          elemento.namekey = elemento.name + this.getNewKey;
        });
      }
      this.$forceUpdate();
    });
    esmaxDashboardEventBus.$on('resetGrid', () => {
      this.reset();
    });
  }

  valideText(text: string): string {
    let returnText: string = '';
    let array: string[] = text.split(' ');
    for (let word of array) {
      returnText += this.ortographyDict[word]
        ? this.ortographyDict[word]
        : word + ' ';
    }
    return returnText;
  }
}
</script>
<style scoped>
#gridPrincipal {
  display: grid;
  column-gap: 20px;
  row-gap: 30px;
  grid-template-columns: 12fr;
}
#gridSecundario {
  display: grid;
  column-gap: 20px;
  row-gap: 30px;
  grid-template-columns: 12fr;
}
.elemento {
  align-content: center;
  justify-content: center;
}
.card {
  align-content: center;
  justify-content: center;
}
@media (min-width: 600px) {
  #gridPrincipal {
    grid-template-columns: repeat(2, 6fr);
  }
  #gridSecundario {
    grid-template-columns: 12fr;
  }
  .elemento {
    align-content: center;
    justify-content: center;
    text-align: center;
  }
}
</style>
