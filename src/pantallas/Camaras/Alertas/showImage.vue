<template>
  <div
    v-if="
      this.params.data.evidencia != undefined &&
        this.params.data.evidencia != '' &&
        this.params.data.evidencia != '[]'
    "
  >
    <v-btn
      v-for="url in JSON.parse(this.params.data.evidencia)"
      :key="url"
      flat
      small
      class="btnEvidencia"
      color="primary"
      @click="showImage(url)"
      style="min-width:30px!important;"
    >
      <v-icon
        v-if="
          url
            .split('.')
            .pop()
            .toLowerCase() == 'mp4'
        "
        class="importExportBtnIcon"
        :url="url"
        >videocam</v-icon
      >
      <v-icon v-else class="importExportBtnIcon" :url="url"
        >photo_camera</v-icon
      > </v-btn
    ><br />
  </div>
  <div v-else>
    <p>
      Sin Evidencia
    </p>
  </div>
</template>

<script>
import Vue from 'vue';
import config from '@/config/index';

export default Vue.extend({
  data: function() {
    return {
      cellValue: null,
    };
  },
  methods: {
    showImage(url) {
      return this.params.openImage(url);
    },
    test(x) {
      return x;
    },
    normalizeName(name) {
      if (name == undefined) {
        return '';
      }
      let x = name;
      if (x.length > 15) {
        x = x.substr(x.length - 15);
      }
      return x;
    },
  },
});
</script>
<style>
.btnEvidencia {
  padding: 0px;
  margin: 6px 0px;
}
</style>
