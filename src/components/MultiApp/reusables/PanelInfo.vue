<template>
  <div class="panelScoped" fluid>
    <div v-if="appsLoaded" style="margin-top:30px; ">
      <btn-linked
        v-if="appNames.includes('SucursalVirtual')"
        :link="'Mis-Solicitudes'"
        :titulo="'SUCURSAL VIRTUAL'"
        :srcs="'icono_sucursal_virtual'"
      />
      <btn-linked
        v-if="false"
        :link="'a'"
        :titulo="'PAGAR EN LINEA'"
        :srcs="'icono_pagar_en_linea'"
      />
      <btn-linked
        v-if="appNames.includes('SucursalVirtual')"
        :link="'Ver-Facturacion'"
        :titulo="'FACTURAS PENDIENTES'"
        :srcs="'icono_facturas_pendientes'"
      />
      <btn-linked
        :link="'https://certificados.gpschile.com/'"
        :titulo="'EMITIR CERTIFICADO'"
        :srcs="'icono_emitir_certificados'"
        :clase="'background-size80'"
      />
      <btn-linked
        v-if="false"
        :link="'a'"
        :titulo="'ACTUALIZACIÓN DE DATOS'"
        :srcs="'icono_actualizacion_de_datos'"
      />
    </div>
    <div style="margin-top:20px;  width:60%" class="imgPublicidad">
      <v-img :src="require(`../assetsHome/publicidad.png`)"></v-img>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BotonLinkMenu from './BotonLinkMenu.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { eventBus, filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import config from '@/config';
import { watch } from 'fs';
import { LoadingService } from '@/services/loadingService';

@Component({
  components: {
    'btn-linked': BotonLinkMenu,
  },
})
export default class PanelInfo extends Vue {
  @Prop({ default: true }) show!: boolean;
  @Prop({ default: '' }) titulo!: string;
  @Prop({ default: '' }) texto!: string;
  appNames: any = this.$store.getters.getApplicationNames;
  appsLoaded: boolean = false;
  loadingService = new LoadingService();

  map: google.maps.Map;
  infoWindow = new google.maps.InfoWindow({
    content: '',
    disableAutoPan: true,
  });
  locations: any = [];
  labels: any = [];

  constructor() {
    super();
  }

  async mounted() {
    this.loadwidgets();
  }

  async created() {
    this.appNames = this.$store.getters.getApplicationNames;
    filtroHomeEventBus.$on('clienteMultiApp', (cliente: number) => {
      this.loadwidgets();
    });
  }

  loadwidgets() {
    let myInterval = setInterval(() => {
      if (this.$store.getters.getApplicationNames !== undefined) {
        this.appNames = this.$store.getters.getApplicationNames;
        this.appsLoaded = true;
        clearInterval(myInterval);
      }
    }, 1000);
  }
}
</script>
<style scoped>
.panelScoped {
  height: 80vh;
  width: 90%;
  margin-left: 10%;
}
@media (max-width: 200px) {
  .imgPublicidad {
    width: 100%;
  }
}
</style>
