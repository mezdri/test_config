<template>
  <v-data-table
    class="elevation-1 table"
    :headers="encabezados"
    :items="visitas"
    :search="busqueda"
    :pagination.sync="pageConfig"
    no-data-text="No hay registros"
    no-results-text="No hay registros"
  >
    <template v-slot:items="visita">
      <td>{{ visita.item.patente }}</td>
      <td>{{ visita.item.caso }}</td>
      <td>{{ visita.item.fechaCoordinacion }}</td>
      <td>{{ visita.item.tecnicoNombre }}</td>
      <td>{{ visita.item.clienteContactado }}</td>
      <td>{{ visita.item.estado }}</td>
      <td>{{ visita.item.identificador }}</td>
      <td>{{ visita.item.tipoVisita }}</td>
      <td>{{ visita.item.fechaCierreCaso }}</td>
      <td>{{ visita.item.glosa }}</td>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { headers } from '@/pantallas/SucursalVirtual/MisVisitas/misVisitasHeaders';

@Component
export default class TablaMisVisitas extends Vue {
  @Prop({ default: [] }) visitas: any;
  @Prop({ default: '' }) busqueda: string;
  encabezados = headers;
  pageConfig = {
    rowsPerPage: 25,
  };
}
</script>
