<template>
  <v-menu left origin="center center" transition="scale-transition">
    <v-btn slot="activator" icon>
      <v-icon color="#526da5" v-if="params.data.estado == activeStatus"
        >check_circle_outline</v-icon
      >
      <v-icon color="#526da5" v-if="params.data.estado == inactiveStatus"
        >remove_circle_outline</v-icon
      >
      <v-icon small color="#526da5">arrow_drop_down</v-icon>
    </v-btn>
    <v-list>
      <v-list-tile style="height:40px;">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            icon
            @click="actionClick(4, params.value, activeStatus)"
            :disabled="params.data.estado == activeStatus"
          >
            <v-icon color="#526da5">check_circle_outline</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="
            !params.data.estado == activeStatus
              ? actionClick(4, params.value, activeStatus)
              : null
          "
          >Activo</v-list-tile-title
        >
      </v-list-tile>
      <v-list-tile style="height:40px;">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            icon
            @click="actionClick(4, params.value, inactiveStatus)"
            :disabled="params.data.estado == inactiveStatus"
          >
            <v-icon color="#526da5">remove_circle_outline</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="
            !params.data.estado == inactiveStatus
              ? actionClick(4, params.value, inactiveStatus)
              : null
          "
          >Inactivo</v-list-tile-title
        >
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import Vue from 'vue';
import { EstadoEntidad } from '../config/enums';
import { actionsEvent } from '../setup';

export default Vue.extend({
  data: function() {
    return {
      activeStatus: EstadoEntidad.Activo,
      inactiveStatus: EstadoEntidad.Inactivo,
    };
  },
  props: {},
  methods: {
    actionClick(action, id, estado) {
      actionsEvent.$emit('actionsEvent', {
        action: action,
        id: id,
        estado: estado,
      });
    },
  },
  mounted() {},
});
</script>
