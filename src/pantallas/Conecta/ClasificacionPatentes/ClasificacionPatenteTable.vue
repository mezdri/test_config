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
      <!-- TODO hacer mas dinamica la parte de acciones -->
      <td class="layout px-0">
        <v-btn
          icon
          flat
          color="primary"
          title="Editar"
          @click="clasificate(props.item)"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </td>
    </template>
    <template v-slot:no-data>
      <div class="center">
        No se han encontrado resultados para la búsqueda.
      </div>
    </template>
  </v-data-table>
</template>
<script>
import { boolean } from 'yup';
export default {
  name: 'ClasificacionPatenteTable',
  props: {
    search: {
      type: String,
      required: true,
    },
    isClasificated: {
      type: Boolean,
      default() {
        return false;
      },
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
    isConfiguration: {
      type: Boolean,
      default() {
        return false;
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
    clasificate(item) {
      this.$emit('clasificate', item);
    },
  },
};
</script>
<style scoped>
.center {
  display: flex;
  height: 15rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
</style>
