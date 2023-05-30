<template>
  <div>
    <v-container grid-list-xs>
      <v-layout row wrap>
        <div align="left">
          <v-flex md12>
            <h2 class="h2_title">Asignar plataformas</h2>
          </v-flex>
        </div>
      </v-layout>
      <v-divider></v-divider>
      <br />
      <div style="max-height: 4px">
        <v-progress-linear
          indeterminate
          color="primary"
          v-show="cargando"
        ></v-progress-linear>
      </div>
      <v-layout row wrap>
        <v-select
          name="plataforma"
          v-model="modelPlataforma"
          v-validate="'required'"
          :items="itemsPlataforma"
          item-text="nombre"
          item-value="id"
          label="Filtrar Plataforma..."
          hide-details
          required
          solo
          flat
          data-vv-name="filtroplataforma"
          @change="changeFiltro()"
          :error-messages="errors.collect('filtroplataforma')"
        ></v-select>

        <v-select
          name="filtro"
          v-show="showFiltro"
          v-model="model"
          v-validate="'required'"
          :items="items"
          item-text="nombre"
          item-value="id"
          label="Filtrar..."
          hide-details
          required
          solo
          flat
          data-vv-name="filtroplataforma"
          @change="changeFiltro()"
          :error-messages="errors.collect('filtroplataforma')"
        ></v-select>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import Confirmation from '@/components/Confirmation.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { Plataformas } from '@/interfaces/AsignacionTransportista/Plataformas';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import { asociacionEventBus } from '@/setup';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class AsignacionFiltroPlataforma extends ComponenteBase {
  items: any = [];
  itemsPlataforma: any = [];
  model: any = null;
  modelPlataforma: any = null;
  modelPlataformaLast: any = null;
  modelLast: any = null;
  seleccion: any = {};
  dictionaryFormErrors: any = {};
  Plataformas = new Plataformas();
  plataformas = new Plataformas().plataformas;
  filtros = new Plataformas().filtros;
  path: string = 'mantenedor_transp_mandante/get_dropdowns';
  flotas: any = null;
  grupos: any = null;
  transportistas: any = null;
  mandantes: any = null;
  cargando: boolean = false;
  showFiltro: boolean = false;

  constructor() {
    super();
  }

  readonly funcionalidad: Funcionalidades = Funcionalidades.Inicio;

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  indicadores: PermisoAccion = {
    accionCodigo: 8,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.indicadores];

  reset() {
    this.model = null;
    this.seleccion = {};
  }

  async validar() {
    return await this.$validator.validateAll();
  }
  created() {
    this.dictionaryFormErrors = {
      custom: {
        name: {
          required: () => 'hola',
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
    this.items = this.filtros;
    this.itemsPlataforma = this.plataformas;
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response.data;
  }
  async getData() {
    let flotas, grupos, transportistas, mandantes;
    let data = await this.fetchDashboard(
      {
        plataforma: this.Plataformas.getNombrePorIdPlataformas(
          this.modelPlataforma
        ),
      },
      this.path
    );
    ({ flotas, grupos, transportistas, mandantes } = data);
    this.flotas = flotas;
    this.grupos = grupos;
    this.transportistas = transportistas;
    this.mandantes = mandantes;
    this.cargando = false;
    this.showFiltro = true;
    this.modelPlataforma == 2
      ? (this.items = [this.filtros[0]])
      : (this.items = this.filtros);
  }
  async changeFiltro() {
    let result = await this.validar();
    if (this.modelPlataforma != this.modelPlataformaLast) {
      asociacionEventBus.$emit('resetBusqueda', true);
      this.model = null;
      this.cargando = true;
      this.showFiltro = false;
      this.modelPlataformaLast = this.modelPlataforma;
      this.getData();
    }
    if (this.model != this.modelLast) {
      asociacionEventBus.$emit('resetBusqueda', true);
      this.modelLast = this.model;
    }
    if (result) {
      let filtro = {
        key: this.model,
        value: this.Plataformas.getNombrePorIdFiltros(this.model),
      };
      switch (filtro.key) {
        case 0:
          asociacionEventBus.$emit(
            'seleccionPlataformaAsignacion',
            filtro,
            this.flotas,
            this.modelPlataforma
          );
          break;
        case 1:
          asociacionEventBus.$emit(
            'seleccionPlataformaAsignacion',
            filtro,
            this.grupos,
            this.modelPlataforma
          );
          break;
        case 2:
          asociacionEventBus.$emit(
            'seleccionPlataformaAsignacion',
            filtro,
            {},
            this.modelPlataforma
          );
          break;
      }
      asociacionEventBus.$emit(
        'setTrnasportistas',
        this.transportistas,
        this.mandantes
      );
    }
  }
}
</script>
