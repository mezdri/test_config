<template>
  <v-container v-show="show">
    <v-layout row wrap class="mb-4">
      <div align="left">
        <v-flex md12>
          <h2 class="h2_title">Selección de vehículos</h2>
        </v-flex>
      </div>
    </v-layout>
    <v-divider></v-divider>
    <br />
    <br />

    <v-layout v-show="showSelectBusqueda">
      <v-layout class="mx-4">
        <v-autocomplete
          name="filtro"
          v-show="showSelectBusqueda"
          v-validate="'required'"
          item-text="desc"
          item-value="cod"
          :label="`${labelSelect}`"
          v-model="elementoFiltroSeleccionados"
          :items="elementosSelect"
          flat
          required
          @change="handleSelect()"
        >
        </v-autocomplete>
      </v-layout>
    </v-layout>
    <v-layout v-show="showInputBusqueda">
      <form @submit.prevent="submit">
        <v-text-field
          v-model="search"
          label="Buscar patente..."
          single-line
          hide-details
        ></v-text-field>
        <div>
          <v-btn type="submit" color="#27488E" fab small dark>
            <v-icon>search</v-icon>
          </v-btn>
        </div>
      </form>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { asociacionEventBus } from '@/setup';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import config from '@/config/index';
import store from '@/store';

@Component
export default class AsignacionBusqueda extends Vue {
  show = false;
  showSelectBusqueda: boolean = false;
  showInputBusqueda: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  controllerFlota: string = 'flota';
  controllerEtiqueta: string = 'VehiculoEtiqueta';
  controllerVehiculo: string = 'Vehiculo';
  usuarioId: number = store.state.userId;
  labelSelect: string = 'Busqueda';
  elementosSelect: any = []; // ? DATA de etiquetas
  elementoFiltroSeleccionados: number = null; // ? DATA seleccionada
  nroElementosFocus: number;
  checkAll: boolean = false;
  filtroKey: number = null;
  dictionaryFormErrors: any = {};
  plataforma: any = {};
  filtroNoAsignados: boolean = false;
  habilitarFiltro: boolean = false;

  search: string = '';

  mounted() {
    this.dictionaryFormErrors = {
      custom: {
        filtroplataforma: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);

    asociacionEventBus.$on(
      'seleccionPlataformaAsignacion',
      (filtro: any, elemento: any, plataforma: any) => {
        this.plataforma = plataforma;
        this.elementoFiltroSeleccionados = null;
        this.show = true;
        this.filtroKey = filtro.key;
        this.filtroKey < 2
          ? (this.elementosSelect = elemento)
          : asociacionEventBus.$emit('PatenteSeleccion', '', this.filtroKey);
        this.filtroKey <= 2
          ? this.showBusqueda(true, filtro.key, filtro.value)
          : this.showBusqueda(false, filtro.key, filtro.value);
      }
    );

    asociacionEventBus.$on('resetBusqueda', (flag: boolean) => {
      this.elementoFiltroSeleccionados = null;
      this.showInputBusqueda = false;
      this.showSelectBusqueda = false;
      this.show = false;
      this.filtroKey = null;
    });
  }
  reset() {
    this.elementoFiltroSeleccionados = null;
    this.elementosSelect = [];
    this.search = null;
    this.show = false;
    this.showSelectBusqueda = false;
    this.showInputBusqueda = false;
  }
  submit() {
    this.agregaPatente(this.search);
  }
  showBusqueda(value: boolean, key: number = -1, lable: string) {
    const clienteId = config.getClienteSesion();
    this.showInputBusqueda = false;
    this.showSelectBusqueda = value;

    if (value) {
      switch (key) {
        case 0:
          this.labelSelect = lable;
          break;
        case 1:
          this.labelSelect = lable;
          break;
        case 2: {
          this.showSelectBusqueda = false;
          this.showInputBusqueda = true;
          break;
        }
      }
    }
  }
  handleCheckBox() {
    asociacionEventBus.$emit(
      'EtiquetaFlotaSeleccionFiltro',
      this.filtroNoAsignados
    );
  }
  async validar() {
    await this.$validator.validateAll();
  }
  handleSelect() {
    asociacionEventBus.$emit(
      'EtiquetaFlotaSeleccion',
      this.elementoFiltroSeleccionados,
      this.plataforma,
      this.filtroKey
    );
    this.habilitarFiltro = true;
    this.validar();
  }
  agregaPatente(patente: string) {
    this.habilitarFiltro = true;
    asociacionEventBus.$emit('PatenteSeleccion', patente, this.filtroKey);
  }
}
</script>
