<template>
  <div>
    <!-- TODO cada step deberia ser un componente -->
    <v-dialog v-model="isDialogOpen" fullscreen>
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="close()">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Certificado de Dispositivos
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-divider></v-divider>

        <v-card-text center>
          <object
            style="width: inherit; height: 720px;"
            v-show="pdfObject"
            :data="pdfObject"
            type="application/pdf"
          ></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { LoadingService } from '@/services/loadingService';
import TorreControlInstance from '@/pantallas/TorreControl/comunes/Instances';
import { DispositivosService } from '@/pantallas/TorreControl/ControlDispositivos/dispositivosService';

@Component({
  components: {
    //FlotaFilterAutocomplete,
  },
})
export default class certificadoDispositivo extends Vue {
  headers: string[];
  desserts: string[];
  idCamara: string = '';
  step: number = 0;
  clientId: string = '';
  isLoading: boolean = false;
  $snotify: any;
  dataPdf: any = {};
  tipo: string = '';
  dispositivosService = new DispositivosService();

  isDialogOpen: boolean = false;
  isClosed: boolean = false;
  pdfObject: string = '';
  $notify: any;

  readonly loadingService = new LoadingService();

  mounted() {
    let _self = this;
    this.clientId = localStorage.getItem('clienteDefecto');
    TorreControlInstance.$off('openCertificate');
    TorreControlInstance.$on('openCertificate', function(data: any) {
      _self.dataPdf = data;
      _self.open();
    });
  }

  async open() {
    let self = this;
    this.isDialogOpen = true;
    this.isClosed = false;
    if (this.dataPdf.infoVehiculo.esquema_bd == 'anglo') this.tipo = '36';
    else this.tipo = '35';
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.dispositivosService.getCertificadoPdf(
      this.clientId,
      this.dataPdf.patente,
      this.dataPdf,
      this.tipo
    );
    this.isLoading = false;
    const msRespose: any = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA == '1') {
      this.pdfObject = msRespose.url;
    } else {
      this.pdfObject = '';
      this.$snotify.error(msRespose.MENSAJE_RESPUESTA);
      this.loadingService.hideLoading();
      this.close();
    }
    this.loadingService.hideLoading();
  }

  close() {
    this.step = 1;
    this.isClosed = true;
    this.isDialogOpen = false;
    this.pdfObject = '';
  }

  @Watch('triggerDialogOpen')
  watchTriggerDialogOpen() {
    this.open();
  }
}
</script>
<style>
.boton {
  background-color: #ffe800 !important;
  color: black !important;
}
</style>
