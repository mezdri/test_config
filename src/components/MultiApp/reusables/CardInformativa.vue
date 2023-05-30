<template>
  <div style="width:100%; height:50%" v-if="show">
    <v-container class="container">
      <p class="titulo">{{ elemento[0].titulo }}</p>
      <p class="texto">{{ elemento[0].mensaje }}</p>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { IPantallaVm } from './fetchPantallaVm';

@Component({
  components: {},
})
export default class CardInformativa extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: () => ({ titulo: 'hola', mensaje: 'algo' }) })
  elemento!: IPantallaVm[];

  map: google.maps.Map;
  elementosShow: any;
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  });
  locations: any = [];
  labels: any = [];

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.elementosShow = this.elemento;
    console.log(this.elementosShow);
  }
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
  margin-left: 0px;
  margin-bottom: 10px;
}
.titulo {
  font-size: 22pt;
  font-family: 'Asap';
  font-weight: bold;
  color: #606060;
}
.texto {
  font-family: 'Asap';
  font-size: 12pt;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
  color: #606060;
}
</style>
