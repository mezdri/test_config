<template>
  <div
    class="boxBtn"
    @click="eventClick(link)"
    style="display:flex; cursor: pointer; box-shadow: 0px 0px 4px -2px rgba(4, 4, 4, 1);; margin-top:10px; width:70%; height:50px; flex-direction:row"
  >
    <v-img
      style="margin-left:0px"
      max-height="40"
      max-width="40"
      width="40"
      height="40"
      :class="clase"
      :src="require(`../assetsHome/${srcs}.png`)"
    ></v-img>
    <div class="txtBtn" style="width:70px">
      <p outline style="border:0px;" text>{{ titulo }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class BotonLinkMenu extends Vue {
  @Prop({ default: '' }) titulo!: string;
  @Prop({ default: '' }) link!: string;
  @Prop({ default: '' }) srcs!: string;
  @Prop({ default: '' }) clase!: string;

  map: google.maps.Map;
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  });
  locations: any = [];
  labels: any = [];

  mounted() {}
  eventClick(link: string) {
    let routeData = link;

    window.open(routeData, '_blank');
  }
}
</script>
<style scoped>
.background-size80 {
  margin-top: 4px;
}
.p {
  font-family: 'Roboto, sans-serif';
  font-size: 13pt;
  white-space: 'break-spaces';
}
.txtBtn {
  font-display: 'Roboto, sans-serif';
}
@media (max-width: 780px) {
  .boxBtn {
    box-shadow: rgb(4 4 4) 0px 0px 0px 0px !important;
  }
}
</style>
