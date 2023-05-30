<template>
  <div class="ma-3">
    <v-progress-linear
      indeterminate
      color="primary"
      v-show="!showGrafico"
    ></v-progress-linear>
    <div v-show="showGrafico">
      <barComp :height="280" ref="doughnutCompRef" />
    </div>
  </div>
</template>

<script lang="ts">
import { Pie } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { values } from 'lodash';

@Component({
  components: {
    barComp: Pie,
  },
})
export default class GraficoBarraPie extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  showGrafico: boolean = false;
  labels: any[] = [];
  resultado: any[] = [];
  datasets: any[] = [];
  colores: any[] = [];

  mounted() {
    if (this.dataInicial) {
      this.showGrafico = true;
      // let lables = this.getLabels();
      this.dataInicial.data.map((data: any) => {
        let values = this.getValues(data);
        this.labels = [...this.labels, values[1]];
        this.resultado = [...this.resultado, values[0]];
        this.colores = [...this.colores, this.generateLightColorHex()];
      });
      this.datasets = [
        {
          label: 'Data One',
          backgroundColor: this.colores,
          data: this.resultado,
        },
      ];
      // (this.$refs.doughnutCompRef as Pie).addPlugin(ChartDataLabels);
      (this.$refs.doughnutCompRef as Pie).renderChart(
        {
          labels: this.labels,
          datasets: this.datasets,
        },
        {
          legend: {
            display: false,
          },
        }
      );
    }
  }
  generateLightColorHex() {
    let color = '#';
    for (let i = 0; i < 2; i++)
      color += (
        '0' +
        Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
      ).slice(-3);
    return color;
  }
  getValues(aux: any) {
    return Object.values(aux);
  }
}
</script>
