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
import { Bar } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { parse } from 'querystring';
import { parseInt } from 'lodash';

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
  datasets: any = [];
  pluginOptions: any = {
    datalabels: {
      anchor: 'end',
      align: 'end',
      labels: {
        value: {
          color: 'black',
        },
      },
    },
  };
  mounted() {
    if (this.dataInicial) {
      // console.log(this.dataInicial);
      this.showGrafico = true;
      this.dataInicial.data.map((data: any) => {
        let values = this.getValues(data);
        if (values.length == 2) {
          this.labels = [...this.labels, values[1]];
          this.resultado = [...this.resultado, values[0]];
          this.datasets = [
            ...this.datasets,
            {
              data: [values[0]],
              label: values[1],
              backgroundColor: this.generateLightColorHex(),
            },
          ];
        }
        // console.log(this.datasets);
      });
      (this.$refs.barChart as Bar).renderChart(
        {
          labels: [this.dataInicial.name],
          datasets: this.datasets,
        },
        {
          responsive: true,
          // maintainAspectRatio: false,
          scales: {
            yAxes: [
              {
                ticks: {
                  min: 0,
                  beginAtZero: true,
                },
              },
            ],
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
