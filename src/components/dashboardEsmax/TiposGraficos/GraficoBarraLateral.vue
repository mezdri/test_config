<template>
  <div>
    <v-progress-linear
      indeterminate
      color="primary"
      v-show="!showGrafico"
    ></v-progress-linear>
    <div v-show="showGrafico">
      <barComp :height="280" ref="barChart" />
    </div>
  </div>
</template>

<script lang="ts">
import { HorizontalBar } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {
    barComp: HorizontalBar,
    barCompO: HorizontalBar,
  },
})
export default class GraficoBarraLateral extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  showGrafico: boolean = false;
  labels: any[] = [];
  resultado: any[] = [];
  datasets: any[] = [];
  pluginOptions: any = {
    legend: {
      display: false,
      labels: {
        display: false,
      },
    },
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

  mounted() {
    if (this.dataInicial) {
      this.dataInicial.data.map((data: any) => {
        let values: any = this.getValues(data);
        this.labels = [...this.labels, values[1]];
        this.resultado = [...this.resultado, values[0]];
        this.datasets = [
          {
            data: this.resultado,
            label: this.dataInicial.name,
            backgroundColor: this.generateLightColorHex(),
          },
        ];
      });

      this.showGrafico = true;
      (this.$refs.barChart as HorizontalBar).renderChart(
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
  getValues(aux: any) {
    return Object.values(aux);
  }
  generateLightColorHex() {
    let color = '#';
    for (let i = 0; i < 3; i++)
      color += (
        '0' +
        Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
      ).slice(-2);
    return color;
  }
}
</script>
