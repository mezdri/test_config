<template>
  <div
    style="cursor:pointer; border-shadow:1px"
    @mouseover="changehover(true)"
    @mouseleave="changehover(false)"
  >
    <div class="container" v-on:click="gotolink(link)" v-if="!onhover">
      <v-img
        cover
        style="object-fit: cover;"
        :src="require(`../assetsHome/isotipo_producto_${colorIsotipo}.png`)"
      ></v-img>
      <p :style="[{ color: colorTexto, 'text-align': 'center' }]">
        {{ titulo }}
      </p>
    </div>
    <div class="container" v-on:click="gotolink(link)" v-else>
      <v-img
        cover
        style="object-fit: cover;"
        :src="require(`../assetsHome/isotipo_producto_amarillo.png`)"
      ></v-img>
      <p
        style="color:#4169e1; font-family: Asap; font-size: 10px; width: 75px; height: 40px; justify-content: center; text-align: center;"
      >
        {{ tituloHover }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class ChipAplication extends Vue {
  @Prop({ default: '' }) colorIsotipo!: string;
  @Prop({ default: '' }) titulo!: string;
  @Prop({ default: '' }) tituloHover!: string;
  @Prop({ default: '' }) colorTexto!: string;
  @Prop({ default: false }) externa!: boolean;
  @Prop({ default: '' }) link!: string;

  map: google.maps.Map;
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  });
  locations: any = [];
  labels: any = [];
  onhover: boolean = false;

  mounted() {}
  gotolink(link: string) {
    if (this.externa) {
      window.open(link, '_blank');
    } else {
      window.location.href = '/' + link;
    }
  }
  changehover(val: boolean) {
    if (this.colorIsotipo != 'amarillo') this.onhover = val;
  }
}
</script>
<style scoped>
.container {
  width: 115px;
  height: 115px;
  position: relative;
  padding: 5px 0px 0px 10px !important;
  overflow: hidden;
  margin-left: 20px;
}
.container img {
  height: 100%;
  object-fit: cover;
}

.container p {
  font-size: 1.1rem;
  position: absolute;
  font-family: 'Asap, sans-serif';
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
}
.container:hover {
  width: 115px;
  height: 112px;
}
</style>
