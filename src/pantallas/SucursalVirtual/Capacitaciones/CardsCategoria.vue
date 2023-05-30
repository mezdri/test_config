<template>
  <div class="modal-options__layout">
    <div v-for="item in dataOption" :key="item.idopcion" class="card">
      <div class="card_layout">
        <section>
          <p>{{ item.titulo }}</p>
          <p>{{ item.subtitulo }}</p>
        </section>

        <figure v-if="manualOption">
          <v-icon
            class="modal-options__icon icon_eye"
            @click="toggleUrl(item.url, true, item.titulo)"
          >
            visibility
          </v-icon>

          <a
            @click="toggleUrl(item.url, false)"
            :href="url"
            download
            target="_blank"
          >
            <v-icon class="modal-options__icon">download</v-icon>
          </a>
        </figure>

        <figure v-else>
          <a :href="item.url" target="_blank">
            <v-icon class="modal-options__icon">play_circle_outline</v-icon>
          </a>
        </figure>
      </div>
    </div>
    <ModalViewPDF v-if="dialog" :url="url" :title="title" @cerrar="toggleUrl" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import ModalViewPDF from '@/pantallas/SucursalVirtual/Capacitaciones/ModalViewPDF.vue';
@Component({
  components: { ModalViewPDF },
})
export default class CardsCategoria extends Vue {
  @Prop({ default: [] }) dataOption: any[];
  @Prop({ default: true }) manualOption: boolean;

  dialog: boolean = false;
  url: string = '';
  title: string = '';

  toggleUrl(url: string, optionModal: boolean = true, title: string = '') {
    if (optionModal) {
      this.url = `${process.env.VUE_APP_SERVICIO_MS}track/view?url=${btoa(
        url
      )}`;
      this.title = title;
      this.dialog = !this.dialog;
    } else {
      this.url = `${process.env.VUE_APP_SERVICIO_MS}track/view?url=${btoa(
        url
      )}&download=SI`;
    }
  }
}
</script>
