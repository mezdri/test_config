<template>
  <v-data-table
    :headers="config.headers"
    :items="dataTable"
    class="elevation-1"
    :pagination.sync="pagination"
    :rows-per-page-items="rowsPerPageItems"
    :search="search"
  >
    <template v-slot:items="props">
      <td v-for="header in fieldsColum" :key="header.value">
        {{ props.item[header.value] }}
      </td>
      <td>
        <AsignacionDialog :vehiculo="props.item" />
      </td>
    </template>
    <template v-slot:no-data>
      <div class="center">
        No se han encontrado resultados para la búsqueda.
      </div>
    </template>
  </v-data-table>
</template>

<script lang="ts"></script>

<script>
import { Vue, Component, Prop } from 'vue-property-decorator';
import AsignacionDialog from './AsignacionDialog.vue';

export default {
  name: 'FlotaVehiculoTable',
  props: {
    search: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default() {
        return {
          headers: [],
          actions: [],
        };
      },
    },
    dataTable: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      rowsPerPageItems: [
        10,
        25,
        50,
        100,
        { text: '$vuetify.dataIterator.rowsPerPageAll', value: -1 },
      ],
      pagination: {
        sortBy: 'cod_vehiculo',
        page: 0,
        rowsPerPage: 25,
        totalItems: this.dataTable.length,
      },
      fieldsColum: [],
    };
  },
  created() {
    this.fieldsColum = this.config.headers.filter(header => header.value);
  },

  methods: {
    initialize() {},
  },

  components: {
    AsignacionDialog,
  },
};
</script>
