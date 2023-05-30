<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="tableData"
      :search="search"
      :pagination.sync="pagination"
    >
      <template v-slot:items="props">
        <td>{{ props.item.titulo }}</td>
        <td class="text-xs-center">{{ props.item.num_solicitud }}</td>
        <td class="text-xs-center">{{ props.item.patente }}</td>
        <td class="text-xs-center">{{ props.item.razon_social }}</td>
        <td class="text-xs-center">{{ props.item.rut }}</td>
        <td class="text-xs-center">{{ props.item.ejecutivo }}</td>
        <td class="text-xs-center">{{ props.item.tipo }}</td>
        <td class="text-xs-center">{{ props.item.fecha_creacion }}</td>
        <td class="text-xs-center">
          {{ props.item.descripcion.substring(0, 50) }}...
        </td>
        <td class="text-xs-center">{{ props.item.estado }}</td>
        <td class="text-xs-center">
          <v-icon
            class="mr-2"
            color="blue darken-2"
            @click="showDialog(props.item)"
          >
            visibility
          </v-icon>
        </td>
      </template>
      <template v-slot:no-results>
        <v-alert :value="true" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </template>
      <template v-slot:no-data>
        <v-alert
          :value="true"
          icon="warning"
          color="grey"
          outline
          class="alert"
          style="text-align: center;"
        >
          Lo siento, no hay datos para mostrar :(
        </v-alert>
      </template>
    </v-data-table>
    <mis-solicitudes-dialog
      v-if="dialogVisible"
      :dialog="dialogVisible"
      :item="itemSelected"
      @close="closeDialog($event)"
    ></mis-solicitudes-dialog>
  </v-card>
</template>

<script>
import { MisSolicitudesHeaders } from './table_headers';
import MisSolicitudesDialog from './dialog.vue';

export default {
  name: 'MisSolicitudesTable',
  components: {
    MisSolicitudesDialog,
  },
  props: {
    tableData: Array,
    totalItems: Number,
  },
  data() {
    return {
      headers: MisSolicitudesHeaders,
      search: '',
      dialogVisible: false,
      itemSelected: '',
      pagination: {
        rowsPerPage: 10,
      },
    };
  },
  methods: {
    showDialog(item) {
      this.itemSelected = item;
      this.dialogVisible = true;
    },
    closeDialog(e) {
      this.dialogVisible = e;
    },
  },
};
</script>

<style scoped></style>
