import Vue from 'vue';
import { Emit, Component } from 'vue-property-decorator';

@Component
export class DatosSertecEventBus extends Vue {
  constructor() {
    super();
  }

  @Emit('filtroHome')
  filtroHome(filtro: number = 0, elementosSeleccionados: number[] = []): void {}
}
