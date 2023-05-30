<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap align-center>
      <v-flex xs12 sm6 d-flex>
        <v-select :items="items" label="Standard"></v-select>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from 'vue';
import { EstadoEntidad } from '../config/enums';
import { actionsEvent } from '../setup';

export default Vue.extend({
  data: () => ({
    items: ['Foo', 'Bar', 'Fizz', 'Buzz'],
  }),
  methods: {
    rolClick(rol, id) {
      actionsEvent.$emit('dropRolesEvent', {
        rol: rol,
        id: rol == 1 && this.estadoEntidad == EstadoEntidad.Eliminado ? -1 : id,
      });
    },
  },
  mounted() {},
});
</script>
