<template>
  <div
    class="text-xs-center d-flex align-center"
    style="padding-left: 1px;"
    v-if="compartidoPor != ''"
  >
    <v-avatar :title="`Vehículo compartido por: ${compartidoPor}`">
      <v-icon style="padding-top: 8px; padding-left: 1px;" color="grey" dark
        >directions_car</v-icon
      >
    </v-avatar>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  data: function() {
    return {
      compartidoPor: '',
    };
  },
  mounted() {
    if (this.params.data.compartidoPor !== undefined) {
      this.compartidoPor = this.params.data.compartidoPor;
    }
  },
});
</script>
