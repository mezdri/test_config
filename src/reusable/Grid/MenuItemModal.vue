<template>
  <v-menu
    left
    origin="center center"
    transition="scale-transition"
    :data-testid="`${params.testId ? `${params.testId}__` : ''}MenuItem`"
  >
    <v-btn slot="activator" icon>
      <v-icon color="#526da5">more_vert</v-icon>
    </v-btn>

    <v-list v-show="mostrarMenuAcciones">
      <v-list-tile style="height:40px;" v-if="params.onVerDetalle">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleVerDetalle">
            <v-icon small color="#526da5">info</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="handleVerDetalle"
          >Ver Detalle</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="params.onEditar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleEditar">
            <v-icon small color="#526da5">edit</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleEditar"
          >Editar</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="params.onEliminar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleEliminar">
            <v-icon small color="#526da5">delete</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleEliminar"
          >Eliminar</v-list-tile-title
        >
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import Vue from 'vue';
import config from '@/config/index';

export default Vue.extend({
  data: function() {
    return {
      mostrarMenuAcciones: true,
    };
  },
  methods: {
    handleEliminar() {
      return this.params.onEliminar(this.params.data);
    },
    handleVerDetalle() {
      return this.params.onVerDetalle(this.params.data);
    },
    handleEditar() {
      return this.params.onEditar(this.params.data);
    },
  },
});
</script>
