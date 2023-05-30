<template>
  <div
    :ref="'container'"
    class="fechaRenovacionDocumento"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <v-date-picker
      first-day-of-week="1"
      locale="es-cl"
      scrollable
      v-model="fecha"
      @input="cerrar()"
    ></v-date-picker>
  </div>
</template>
<script>
import Vue from 'vue';
import moment from 'moment';
import { Validator } from 'vee-validate';
export default Vue.extend({
  data() {
    return {
      fecha: '',
      menuDatePickerNacimiento: true,
    };
  },
  props: {
    validacion: { type: Validator },
  },
  methods: {
    getValue() {
      return this.fecha;
    },

    isPopup() {
      return true;
    },

    setfecha(fecha) {
      this.fecha = fecha;
    },
    toggleMood() {
      this.setfecha(this.fecha);
    },
    async cerrar() {
      try {
        await this.params.validacion.validateAll();

        Vue.nextTick(async () => {
          await this.params.validacion.validateAll();
        });

        this.params.stopEditing();
      } catch (error) {
        this.params.stopEditing();
      }
    },
    onKeyDown(event) {
      let key = event.which || event.keyCode;
      if (
        key == 37 || // left
        key == 39
      ) {
        // right
        //this.toggleMood();
        event.stopPropagation();
      }
    },
  },
  created() {
    if (this.params.value === null || this.params.value === '') {
      return '';
    } else {
      this.setfecha(moment(this.params.value).format('YYYY-MM-DD'));
    }
  },
  mounted() {
    // Vue.nextTick(() => {
    //   this.$refs.container.focus();
    // });
  },
});
</script>
