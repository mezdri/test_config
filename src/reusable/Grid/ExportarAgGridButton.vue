<template>
  <ExportarButton v-if="permisoAccion.visible" @click="handleClick()" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { ColDef } from 'ag-grid-community';
import moment from 'moment';

import config from '@/config';
import ExportarButton from '@/reusable/Grid/ExportarButton.vue';
import { Snotify } from '@/snotify/Snotify';

import { PermisoAccion } from '@/views/base/VariablesPermisos';

@Component({
  components: { ExportarButton },
})
export default class ExportarAgGridButton extends Vue {
  @Prop({ required: true }) rowData: any[];
  @Prop({ required: true }) columnDefs: ColDef[];
  @Prop({ required: true }) exportedFileName: string;
  @Prop({
    default: () => ({
      accionCodigo: 0,
      visible: true,
      moduloCodigo: 0,
    }),
  })
  permisoAccion: PermisoAccion;

  $snotify: Snotify;

  handleClick() {
    const emitEvent = () => this.$emit('click');

    if (this.rowData.length < 1) {
      this.$snotify.warning('No existen datos para exportar.');
      return emitEvent();
    }

    config.crearArchivoCsv(
      `${this.exportedFileName}.csv`,
      this.rowData,
      this.columnDefs
    );
    this.$snotify.success(
      this.$t('mensajes.mensajesExito.exportar').toString()
    );
    return emitEvent();
  }
}
</script>
