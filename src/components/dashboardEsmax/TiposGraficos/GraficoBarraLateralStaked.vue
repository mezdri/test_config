<template>
  <div>
    <v-progress-linear
      indeterminate
      color="primary"
      v-show="!showGrafico"
    ></v-progress-linear>
    <div v-show="showGrafico">
      <div class="chartWrapper">
        <div class="chartAreaWrapper">
          <barComp ref="barChart" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { HorizontalBar } from 'vue-chartjs';
import Chart from 'vue-chartjs';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { string } from 'yup';

@Component({
  components: {
    barComp: HorizontalBar,
    barCompO: HorizontalBar,
  },
})
export default class GraficoBarraLateralStaked extends Vue {
  @Prop({ default: [] }) dataInicial!: any;
  largo: number = 0;
  showGrafico: boolean = false;
  labelsPrincipales: any[] = [];
  labelsSecundarias: any[] = [];
  resultado: any = {};
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
      this.largo = this.dataInicial.data.length;
      this.dataInicial.data.map((data: any, indexData: any) => {
        let valuesData = this.getValues(data);
        this.labelsSecundarias = [...this.labelsSecundarias, valuesData[0]];
        data.data.map((subData: any) => {
          let valuesSubdata: any = this.getValues(subData) as any;
          if (this.resultado[valuesSubdata[0]]) {
            this.resultado[valuesSubdata[0]] = [
              ...this.resultado[valuesSubdata[0]],
              { valor: valuesSubdata[1], posicion: indexData },
            ];
          } else {
            this.resultado[valuesSubdata[0]] = [
              { valor: valuesSubdata[1], posicion: indexData },
            ];
          }
          if (this.labelsPrincipales.length == 0) {
            this.labelsPrincipales = [valuesSubdata[0]];
          } else if (this.labelsPrincipales.indexOf(valuesSubdata[0]) === -1) {
            this.labelsPrincipales = [
              ...this.labelsPrincipales,
              valuesSubdata[0],
            ];
          }
        });
      });

      this.labelsPrincipales.map((labe: any) => {
        this.datasets = [
          ...this.datasets,
          {
            label: labe,
            data: this.getData(this.resultado[labe]),
            backgroundColor: this.generateLightColorHex(),
          },
        ];
      });
      this.showGrafico = true;
      (this.$refs.barChart as HorizontalBar).renderChart(
        {
          labels: this.labelsSecundarias,
          datasets: this.datasets,
        },
        {
          tooltips: {
            mode: 'point',
          },
          responsive: true,
          // maintainAspectRatio: false,
          legend: {
            display: true,
            position: 'right',
          },
          scales: {
            yAxes: [
              {
                stacked: true,
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 60,
                },
              },
            ],
            xAxes: [
              {
                stacked: true,
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 60,
                },
              },
            ],
          },
        }
      );
    }
  }
  getData(contenido: any) {
    let array: any = Array.apply(null, Array(this.largo)).map(function(x, i) {
      return '';
    });
    contenido.map((item: any) => {
      array[item.posicion] = item.valor;
    });
    return array;
  }
  getColors() {
    let self = this;
    let array: any = Array.apply(null, Array(this.largo)).map(function(x, i) {
      return self.generateLightColorHex();
    });

    return array;
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
<style>
.chartWrapper {
  position: relative;
  overflow-y: scroll;
}

.chartAreaWrapper {
  height: 400px;
}
</style>
