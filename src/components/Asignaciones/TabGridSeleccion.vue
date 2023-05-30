<template>
  <v-container v-show="show">
    <v-tabs v-model="tab">
      <v-tab v-for="item in items" :key="item.tab" @change="cambio(item)">
        {{ item.tab }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="item.tab">
        <v-card flat>
          <v-card-text>
            <component v-bind:is="item.content" ref="grilla"></component>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GridSeleccion from '@/components/Asignaciones/GridSeleccion.vue';
import GridSeleccionDesasociar from '@/components/Asignaciones/GridSeleccionDesasociar.vue';
import { asociacionEventBus } from '@/setup';

@Component({
  components: { GridSeleccion, GridSeleccionDesasociar },
})
export default class TabGridSeleccion extends Vue {
  show: boolean = false;
  filtroKey: number = null;
  plataformaKey: number = null;
  codigoSeleccionado: number = null;

  items: any[] = [
    { index: 0, tab: 'Asociar', content: 'GridSeleccion', ref: 'asociar' },
    {
      index: 1,
      tab: 'Desasociar',
      content: 'GridSeleccionDesasociar',
      ref: 'desasociar',
    },
  ];
  tab: any = null;
  cambio(item: any) {
    console.log('hola');
    if (item.index) {
      asociacionEventBus.$emit(
        'EtiquetaFlotaSeleccion',
        this.codigoSeleccionado,
        this.plataformaKey,
        this.filtroKey
      );
      asociacionEventBus.$emit('resetPersonal');
    }
  }
  mounted() {
    const refAsociar = this.$refs.grilla as any;
    asociacionEventBus.$on(
      'EtiquetaFlotaSeleccion',
      (codFiltroSeleccion: any, plataforma: any, filtroKey: number) => {
        this.filtroKey = filtroKey;
        this.plataformaKey = plataforma;
        this.codigoSeleccionado = codFiltroSeleccion;

        plataforma;
        if (filtroKey != 2) this.show = true;
      }
    );
    asociacionEventBus.$on('resetGrilla', () => {
      console.log('resetGrilla de tabs');
      this.show = false;
    });
    asociacionEventBus.$on('resetBusqueda', (value: any) => {
      this.reset();
    });
  }
  reset() {
    this.show = false;
  }
}
</script>
