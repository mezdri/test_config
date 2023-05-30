<template>
  <div style="display: flex; width: 100%; height: 100%">
    <div class="containerVideoDiv" @click="sendVideo('ver')">
      <i
        v-if="this.params.data.url != null"
        class="BtnIconSee material-icons"
        style="color: #27488e"
        >videocam_outlined</i
      >
      <i v-else class="material-icons">videocam_off_outlined</i>
    </div>
    <div class="containerVideoDiv" @click="sendVideo('descargar')">
      <i
        v-if="this.params.data.url != null"
        class="BtnIconDownload material-icons"
        style="color: #27488e"
        >file_download_outlined</i
      >
      <i v-else class="material-icons">file_download_off_outlined</i>
    </div>
    <br />
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
    sendVideo(type) {
      if (this.params.data.url != null) {
        if (this.params.data.hasOwnProperty('url_converter')) {
          return this.params.handleVideo(
            this.params.data.url,
            type,
            this.params.data.url_converter
          );
        } else {
          return this.params.handleVideo(this.params.data.url, type);
        }
      }
    },
  },
});
</script>
<style scoped>
.containerVideoDiv {
  width: 50%;
  min-width: 0px !important;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.BtnIconSee {
  width: inherit;
  display: block !important;
  cursor: pointer;
  font-size: 200%;
}

.BtnIconSee:hover {
  /* S */
  font-size: 230%;
}
.BtnIconDownload {
  width: inherit;
  display: block !important;
  cursor: pointer;
  font-size: 200%;
}

.BtnIconDownload:hover {
  /* S */
  font-size: 230%;
}
</style>
