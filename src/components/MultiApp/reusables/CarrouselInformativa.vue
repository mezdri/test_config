<template>
  <v-carousel cycle height="110" hide-delimiters :show-arrows="false" light>
    <v-carousel-item v-for="(slide, i) in elementos" :key="i">
      <v-sheet color="white" height="100%">
        <v-row class="container">
          <p class="titulo">{{ slide.titulo }}</p>
          <p class="texto">{{ slide.mensaje }}</p>
        </v-row>
      </v-sheet>
    </v-carousel-item>
  </v-carousel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class CarrouselInformativa extends Vue {
  @Prop({ default: true }) show!: boolean;
  @Prop({ default: [] }) elementos!: any;

  locations: any = [];
  labels: any = [];

  mounted() {}
}
</script>
<style scoped>
.container {
  align-items: center;
  display: grid;
  height: 120px;
  justify-content: left;
  width: 70%;
  margin-left: 60px;
  margin-bottom: 10px;
}
.titulo {
  font-size: 22pt;
  font-family: 'Asap';
  font-weight: bold;
  color: #404040;
}
.texto {
  font-family: 'Asap';
  font-size: 12pt;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
  color: #404040;
}
.v-carousel {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
}
.v-carousel .v-btn {
  color: #404040;
}
</style>
