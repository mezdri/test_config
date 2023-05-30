<template>
  <v-dialog
    v-model="dialog"
    persistent
    width="300"
    :key="vueKey"
    style="z-index:10000000 !important;"
  >
    <v-card color="primary" dark>
      <v-card-text>
        {{ msg }}
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import loadingEventBus from '@/loadingEventBus';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Loading extends Vue {
  @Prop({ default: 'Por favor espere...' }) texto!: string;
  dialog: boolean = false;
  msg: string = 'Por favor espere...';
  vueKey: number = 0;
  keys: string[] = [];

  mounted() {
    loadingEventBus.$on(
      'loading',
      (show: boolean, texto: string = 'Por favor espere...', key?: string) => {
        if (show) {
          if (key) {
            this.keys = [...this.keys, key];
          }
          this.msg = texto;
          this.dialog = show;
        }

        if (!show) {
          const setDialog = (dialog: boolean) => {
            this.dialog = dialog;
            this.vueKey += 1;
          };

          if (this.keys.length === 0) {
            setDialog(show);
          } else if (this.keys.includes(key)) {
            this.keys = this.keys.filter(x => x !== key);
            setDialog(show);
          }
        }
      }
    );
  }
}
</script>
