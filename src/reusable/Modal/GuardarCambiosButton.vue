<template>
  <GuardarButton @click="handleClick" v-bind="{ ...$props, ...$attrs }">
    Guardar Cambios
  </GuardarButton>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';

@Component({
  components: { GuardarButton },
})
export default class GuardarCambiosButton extends Vue {
  handleClick() {
    this.$emit('click');
  }
}
</script>
