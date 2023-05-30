<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-layout row wrap>
        <v-flex xs12 md2>
          <v-select
            :items="empresas"
            v-model="filterField.IdCliente"
            label="Seleccionar Empresa"
            dense
            clearable
            item-text="nombre"
            item-value="id"
          ></v-select>
        </v-flex>
        <v-flex xs12 md2>
          <v-select
            :items="estados"
            v-model="filterField.IdRazo"
            label="Seleccionar Estado"
            dense
            clearable
            item-text="text"
            item-value="id"
          ></v-select>
        </v-flex>
        <v-flex xs12 md2>
          <v-text-field
            v-model="filterField.filtroTexto"
            append-icon="search"
            label="Buscar..."
            dense
          ></v-text-field>
        </v-flex>
        <v-flex xs12 md2>
          <v-btn class="black--text" @click="$emit('filter', filterField)">
            <v-icon>search</v-icon>
            Filtrar
          </v-btn>
        </v-flex>
        <v-flex xs12 md2>
          <v-btn class="black--text" @click="clearFilter()">
            <v-icon>clear</v-icon>
            Limpiar filtros
          </v-btn>
        </v-flex>
        <v-flex xs12 md2>
          <v-btn class="black--text" @click="$emit('exportar', true)">
            Exportar a Excel
            <v-icon right dark>description</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12 md2>
          <v-btn
            class="black--text"
            @click="advancedFilters = !advancedFilters"
          >
            <v-icon left dark>filter_alt</v-icon>
            Filtros avanzados
          </v-btn>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs12 md3 v-if="advancedFilters">
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="filterField.fechadesde"
                label="Fecha desde"
                prepend-icon="event"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filterField.fechadesde"
              no-title
              @input="menu = false"
            ></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 md3 v-if="advancedFilters">
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="filterField.fechahasta"
                label="Fecha Hasta"
                prepend-icon="event"
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="filterField.fechahasta"
              no-title
              @input="menu2 = false"
            ></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 md3 v-if="advancedFilters">
          <v-select
            :items="categorias"
            v-model="filterField.IdCategoria"
            label="Categoría"
            item-text="nombre"
            item-value="id"
            dense
            clearable
          ></v-select>
        </v-flex>
      </v-layout>
    </v-container>
    <mis-solicitudes-export-dialog
      v-if="showDialog"
      :dialog="showDialog"
      @close="closeDialog($event)"
    ></mis-solicitudes-export-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import MisSolicitudesExportDialog from './exportDialog.vue';
import {
  ConfigCategorias,
  fetchCategorias,
  ConfigEmpresas,
  fetchEmpresas,
  ConfigEstados,
  fetchEstados,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchConfigInicial';
import { Snotify } from '@/snotify/Snotify';

@Component({
  components: {
    MisSolicitudesExportDialog,
  },
})
export default class MisSolicitudesFilters extends Vue {
  readonly $snotify: Snotify;

  empresas: ConfigEmpresas[] = [];
  estados: ConfigEstados[] = [];
  categorias: ConfigCategorias[] = [];
  advancedFilters: boolean = false;
  showDialog: boolean = false;
  menu: boolean = false;
  menu2: boolean = false;

  filterField: any = {
    IdCliente: null,
    IdRazo: null,
    IdCategoria: '',
    fechadesde: '',
    fechahasta: '',
    LstCuentas: '',
    filtroTexto: '',
    OrderBy: 'caso.CreatedOn',
    Orden: 'DESC',
  };

  constructor() {
    super();
    this.getCategorias();
    this.getEmpresas();
    this.getEstados();
  }

  closeDialog(e: boolean) {
    this.showDialog = e;
  }

  async getCategorias() {
    this.categorias = (await this.cargarCategorias()) || [];
    this.categorias.forEach(function(v) {
      if (v.header != '') {
        delete v.nombre;
        delete v.id;
      } else {
        delete v.header;
      }
    });
  }
  cargarCategorias() {
    return fetchCategorias().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las categorias',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las categoriasp',
          { timeout: 3000 }
        );
      }
    });
  }

  async getEmpresas() {
    this.empresas = (await this.cargarEmpresas()) || [];
    this.filterField.LstCuentas = this.empresas[0].idGrupoCuentas;
    this.$emit('lstCuenta', this.empresas[0].idGrupoCuentas);
  }
  cargarEmpresas() {
    return fetchEmpresas().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      }
    });
  }

  async getEstados() {
    const response: any = (await this.cargarEstados()) || [];
    this.estados = response.data.data;
  }
  cargarEstados() {
    return fetchEstados().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los estados',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los estados',
          { timeout: 3000 }
        );
      }
    });
  }

  clearFilter() {
    this.advancedFilters = false;
    this.filterField = {
      IdCliente: null,
      IdRazo: null,
      IdCategoria: '',
      fechadesde: '',
      fechahasta: '',
      LstCuentas: this.empresas[0].idGrupoCuentas,
      filtroTexto: '',
      OrderBy: 'caso.CreatedOn',
      Orden: 'DESC',
    };
  }
}
</script>

<style></style>
