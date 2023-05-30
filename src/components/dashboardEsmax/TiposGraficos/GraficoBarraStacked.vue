<template>
  <div class="ma-3">
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
import { Bar, HorizontalBar } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { extend } from 'lodash';
import { ChartColor, ChartDataSets } from 'chart.js';

export type DatasetType = {
  data: any[];
  label: string;
};

@Component({
  components: {
    barComp: Bar,
  },
})
export default class GraficoBarra extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  showGrafico: boolean = false;
  labels: any[] = [];
  resultado: any[] = [];
  // datasets: ChartDataSets[] =
  // [{
  //   label:'',
  //   data:[]
  // }];
  datasets: any[] = [];

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
  mounted() {
    if (this.dataInicial) {
      this.showGrafico = true;

      var dataonline: any = [];
      dataonline.data = [];
      var dataoffline: any = [];
      dataoffline.data = [];
      this.dataInicial.data.map((data: any) => {
        let values = this.getValues(data);
        if (!this.labels.includes(values[0])) {
          this.labels = [...this.labels, values[0]];
        }
        this.resultado = [...this.resultado, values[1]];

        dataonline.data.push(values[1]);
        dataoffline.data.push(values[2]);
      });

      this.datasets.push(dataonline);
      this.datasets.push(dataoffline);

      (this.$refs.barChart as Bar).renderChart(
        {
          labels: this.labels,
          datasets: [
            {
              label: 'Offline',
              data: dataoffline.data,
              backgroundColor: this.generateLightColorHex(),
            },
            {
              label: 'Online',
              data: dataonline.data,
              backgroundColor: this.generateLightColorHex(),
            },
          ],
        },
        {
          responsive: true,
          // maintainAspectRatio: false,
          plugins: this.pluginOptions,
          scales: {
            xAxes: [{ stacked: true }],
            yAxes: [{ stacked: true }],
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
    for (let i = 0; i < 2; i++)
      color += (
        '0' +
        Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)
      ).slice(-3);
    return color;
  }
}
</script>
