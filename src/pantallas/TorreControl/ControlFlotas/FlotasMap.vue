<template>
  <v-card light>
    <MapHexagon
      :item-size="100"
      :items-gap="5"
      :center="[4, 2]"
      :width="1780"
      :height="540"
      :cells="cells"
      style="border: 0px solid black"
      @click="onClick"
    >
      <template slot-scope="{ index, itemSize }">
        <Hexagon
          :size="itemSize"
          @click="onClick(cells[index].data)"
          :style="cells[index].textStyle"
          :background-color="cells[index].backgroundColor"
        >
          <span style="" v-html="cells[index].text" />
        </Hexagon>
      </template>
    </MapHexagon>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import MapHexagon from '@coddicat/vue-map-hexagon';
import Hexagon from '@coddicat/vue-hexagon';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import {
  ControlVehiculosInterface,
  HexagonCellObj,
} from '@/pantallas/TorreControl/ControlFlotas/controlFlotasInterface';
import { FlotaService } from '@/pantallas/TorreControl/ControlFlotas/flotaService';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';

function generateCells(left: number, right: number): HexagonCellObj[] {
  const cells = Array<HexagonCellObj>();
  let index = 0;
  for (let row = left; row <= right; row++)
    for (let col = left; col <= right; col++) {
      cells.push({
        row: row,
        col: col,
        index: index,
        hexagonClass: 'hexagon-custom',
        borderSize: 1,
        borderColor: undefined,
        backgroundColor: '#62FF43FF',
        backgroundImage: undefined,
        text: ``,
        textStyle: { 'text-align': 'center', display: 'none' },
        data: {
          cod_vehiculo: '',
          patente_vehiculo: '',
          color: '',
          avl: '',
          activo: '',
          colorIndices: {
            red: [],
            green: [],
            yellow: [],
          },
        },
      });
      index++;
    }
  return cells;
}

@Component({
  name: 'FlotasMap',
  components: {
    MapHexagon,
    Hexagon,
  },
})
export default class FlotasMap extends Vue {
  @Prop({ default: [] }) flota!: any[];
  @Prop({ default: [] }) loadData!: any[];
  private eventName = '';
  private eventData = '';
  private cells: HexagonCellObj[] = generateCells(0, 100);
  flotaService = new FlotaService();
  loadingService = new LoadingService();
  isLoading: boolean = false;
  dataVehiculo: ControlVehiculosInterface[] = [];
  clientId: string;
  showInfoDialog: boolean = false;
  vehiculoSelected: any = {};
  filterCells: any = '';

  public onClick(data: any): void {
    TorreControlInstance.$emit('vehiculoSelected', data);
  }

  beforeDestroy() {
    this.cells = [];
  }
  async created() {
    let self = this;
    TorreControlInstance.$off('searchPatente');
    TorreControlInstance.$on(
      'searchPatente',
      (patente: string, filter: boolean) => {
        if (this.loadData) {
          if (patente != '' && !filter) {
            this.vehiculoSelected = this.cells.filter(cell => {
              return cell.data.patente_vehiculo === patente.toUpperCase();
            });
            this.vehiculoSelected = this.vehiculoSelected[0].data;
            if (this.vehiculoSelected.patente_vehiculo) {
              TorreControlInstance.$emit(
                'vehiculoSelected',
                this.vehiculoSelected
              );
            }
          } else if (patente != '' && filter) {
            this.filterCells = patente;
            this.getVehiculos().finally(() => {
              self.loadHexagonCells().finally(() => {});
            });
          } else if ((patente == '' || patente.length < 3) && filter) {
            this.filterCells = '';
            this.getVehiculos().finally(() => {
              self.loadHexagonCells().finally(() => {});
            });
          }
        }
      }
    );
  }

  async mounted() {
    this.clientId = localStorage.getItem('clienteDefecto');
    if (this.loadData) {
      let self = this;
      this.isLoading = true;
      this.loadingService.showLoading();
      await this.getVehiculos().finally(() => {
        self.loadHexagonCells().finally(() => {
          self.loadingService.hideLoading();
        });
        self.isLoading = false;
      });
    }
  }

  async loadHexagonCells() {
    const newCells = Array<HexagonCellObj>();
    let data: ControlVehiculosInterface[] = [];
    data = this.filtrarProductos(this.filterCells);
    TorreControlInstance.$emit('showCount', data.length);
    let x = Math.ceil(Math.sqrt(data.length));
    this.cells = generateCells(0, x);
    for (const key in this.cells) {
      let cell = this.cells[key];
      let vehiculo = data.pop();
      cell.text = `${vehiculo.avl} <br/> ${vehiculo.patente_vehiculo}`;
      cell.backgroundColor = vehiculo.color;
      cell.textStyle = { 'text-align': 'center' };
      cell.data = vehiculo;
      newCells.push(cell);

      if (this.dataVehiculo.length == 0) break;
    }
    newCells.sort(function(a, b) {
      let colors = ['rgb(255 72 72)', '#FFF226', '#26FF26', 'silver'];
      return (
        colors.indexOf(a.backgroundColor) - colors.indexOf(b.backgroundColor)
      );
    });
    this.cells = newCells;
  }

  async getVehiculos() {
    console.log(this.loadData);
    const axiosResponse: AxiosResponse<
      MSResponse<ControlVehiculosInterface>
    > = await this.flotaService.getVehiculosByFlota(
      String(this.flota),
      this.clientId
    );
    const msRespose: MSResponse<ControlVehiculosInterface> = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA === '1') {
      this.dataVehiculo = msRespose.data;
    } else {
      this.dataVehiculo = [];
    }
  }

  filtrarProductos(filtro: string): ControlVehiculosInterface[] {
    if (!filtro || filtro.length < 3) {
      // Si el filtro es vacío, retornar el array original sin filtrar
      return this.dataVehiculo;
    }
    const filtroMin = filtro.toLowerCase();
    return this.dataVehiculo.filter(vehiculo =>
      vehiculo.patente_vehiculo.toLowerCase().includes(filtroMin)
    );
  }
}
</script>

<style>
.pinch-scroll-zoom > .pinch-scroll-zoom__content {
  top: 10% !important;
  left: 10% !important;
}

.button-dialog {
}
</style>
