<template>
  <v-btn class="btn-crear" @click="handleClick()" style="padding-right:0px;">
    <v-icon dark left style="margin-right: 0px; padding-left:0px;"
      >add_circle_outline</v-icon
    >
    <span style="padding-right:7px;">Recalibrar</span>
  </v-btn>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class RecalibrarButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>
<style scoped>
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>
