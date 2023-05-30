<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab @click="selectTable">Dispositivos</v-tab>
    </v-tabs>
    <v-divider />
    <br />
    <searchPatente
      v-show="!this.$route.params.hasOwnProperty('patente')"
      :clientId="clienteId"
    />
    <v-layout align-end justify-end row fill-height>
      <v-flex md1>
        <div>
          <certificadoDispositivo></certificadoDispositivo>
        </div>
      </v-flex>
    </v-layout>
    <v-container class="container-custom" fluid grid-list-md v-show="patente">
      <v-divider />
      <v-card class="mx-auto no-bg" color="rgb(250 250 250)" dark>
        <v-card-title v-if="showInfo">
          <!--          <v-icon large left color="#808080">
            local_shipping
          </v-icon>-->
          <span class="text-h5" style="color: #808080; font-size: 18px;"
            ><strong>Patente</strong>:
            {{ this.infoVehiculo[0].patente_vehiculo }} <br />
            <strong>Ignición</strong>:
            {{
              infoVehiculo[0].ignicion_ult_act == '0' ||
              infoVehiculo[0].ignicion_ult_act == ''
                ? 'Apagado'
                : 'Encendido'
            }}</span
          >
        </v-card-title>
      </v-card>
      <br />
      <div class="right" style="display: flex; margin-top: -50px;">
        <v-btn flat small color="primary" @click="getCertification">
          <v-icon>workspace_premium</v-icon>
          Emitir Certificados
        </v-btn>
        <v-btn
          id="btnExportCsv"
          flat
          small
          color="primary"
          @click="onBtnExport"
        >
          <v-icon class="importExportBtnIcon">cloud_download </v-icon
          >&nbsp;&nbsp;
          <span class="importExportBtnTexto">Exportar CSV</span>
        </v-btn>
      </div>
      <br />
      <v-divider />
      <Datatables
        v-show="tabSelected == 1"
        :headers="headers"
        :dataTable="dataTable"
      />
      <LastLocation :patente="patente" v-if="patente" />
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import Datatables from '@/pantallas/TorreControl/Datatables.vue';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import { headers } from '@/pantallas/TorreControl/ControlDispositivos/controlDispositivosHeaders';
import {
  ControlDispositivosInterface,
  ControlVehiculoInfo,
} from '@/pantallas/TorreControl/ControlDispositivos/controlDispositivosInterface';
import { DispositivosService } from '@/pantallas/TorreControl/ControlDispositivos/dispositivosService';
import searchPatente from '@/pantallas/TorreControl/ControlDispositivos/searchPatente.vue';
import TorreControlInstance from '../comunes/Instances';
import certificadoDispositivo from '@/pantallas/TorreControl/ControlDispositivos/certificadoDispositivo.vue';
import LastLocation from '@/pantallas/TorreControl/ControlDispositivos/lastLocation.vue';

@Component({
  name: 'ControlDispositivos',
  components: {
    LastLocation,
    Datatables,
    searchPatente,
    certificadoDispositivo,
  },
})
export default class ControlDispositivos extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  tabSelected: number = 1;
  clientId: string;
  isLoading: boolean = false;
  patente: string;
  avl: string;
  dataTable: ControlDispositivosInterface[] = [];
  infoVehiculo: ControlVehiculoInfo[] = [];
  infoVehiculo2: any = {};
  dispositivosService = new DispositivosService();
  headers = headers;
  showInfo: boolean = false;
  labelInfo: any = {};
  ignicion: string = '';
  readonly funcionalidad: Funcionalidades = Funcionalidades.TorreControl;
  $notify: any;

  constructor() {
    super();
    this.getClientId();
  }

  getClientId() {
    this.patente = this.$route.params.hasOwnProperty('patente')
      ? this.$route.params.patente
      : '';
    this.avl = this.$route.params.avl;
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  @Watch('$route')
  reset() {
    this.patente = '';
    TorreControlInstance.$emit('reloadSelect');
  }

  created() {
    TorreControlInstance.$off('searchPatenteD');
    TorreControlInstance.$on('searchPatenteD', (response: any) => {
      this.avl = response.avl;
      this.patente = response.patente;
      let _self = this;
      this.getInfoVehiculo().finally(() => {
        _self.getDispositivos().finally(() => {
          TorreControlInstance.$emit('dataTable', this.dataTable);
          TorreControlInstance.$emit('reloadLocation');
          _self.loadingService.hideLoading();
          _self.isLoading = false;
        });
      });
    });
  }

  async mounted() {
    if (this.tabSelected == 1 && this.patente != '') {
      let _self = this;
      this.getInfoVehiculo().finally(() => {
        _self.getDispositivos().finally(() => {
          TorreControlInstance.$emit('dataTable', this.dataTable);
          _self.loadingService.hideLoading();
          _self.isLoading = false;
        });
      });
    }
  }

  selectTable() {
    this.tabSelected = 1;
    let _self = this;
    if (this.patente != '') {
      this.getInfoVehiculo().finally(() => {
        _self.getDispositivos().finally(() => {
          TorreControlInstance.$emit('dataTable', this.dataTable);
          _self.loadingService.hideLoading();
          _self.isLoading = false;
        });
      });
    } else {
      TorreControlInstance.$emit('actPatentes');
    }
  }

  async getDispositivos() {
    this.isLoading = true;
    this.loadingService.showLoading();
    this.dataTable = [];
    const axiosResponse: AxiosResponse<
      MSResponse<ControlDispositivosInterface>
    > = await this.dispositivosService.getDispositivos(
      this.clientId,
      this.patente,
      this.ignicion
    );
    const msRespose: MSResponse<ControlDispositivosInterface> =
      axiosResponse.data;
    let gps_array: ControlDispositivosInterface[] = [];
    this.infoVehiculo2.forEach((item: any) => {
      let gps_device = {
        id_dispositivo: 'Track Vehícular',
        cod_vehiculo: item.cod_vehiculo,
        __nom_flota: item.__nom_flota,
        __desc_grupo_vehiculo: item.__desc_grupo_vehiculo,
        num_sat_ult_act: item.num_sat_ult_act,
        hdop_ult_act: item.hdop_ult_act,
        marca: item.marca || 'GPS',
        tipo_dispositivo: 'GPS',
        fecha_ult_evento: '',
        estado: '#26FF26',
        estado_exp: 'Verde',
      };
      gps_device['fecha_ult_evento'] = item.fecha_actividad;
      if (
        parseFloat(item.hdop_ult_act) > 1.2 ||
        parseFloat(item.num_sat_ult_act) < 6 ||
        item.date_diff == '1'
      ) {
        gps_device['estado'] = 'rgb(255 72 72)';
        gps_device['estado_exp'] = 'Rojo';
      }
      if (
        (this.ignicion == '0' || this.ignicion == '') &&
        gps_device['estado_exp'] == 'Rojo'
      ) {
        gps_device['estado'] = 'silver';
        gps_device['estado_exp'] = 'Desconectado';
      }
      gps_array.push(gps_device);
    });

    if (msRespose.CODIGO_RESPUESTA === '1') {
      this.dataTable = msRespose.data;

      if (this.dataTable.length > 0) {
        gps_array.forEach(item => {
          this.dataTable.unshift(item);
        });
      } else {
        gps_array.forEach(item => {
          this.dataTable.push(item);
        });
      }
    } else {
      this.$snotify.warning(msRespose.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      this.dataTable = [];
      gps_array.forEach(item => {
        this.dataTable.push(item);
      });
    }
  }

  async getInfoVehiculo() {
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<ControlVehiculoInfo>
    > = await this.dispositivosService.getInfoVehiculo(
      this.clientId,
      this.patente,
      this.avl
    );
    this.isLoading = false;
    const msRespose: MSResponse<ControlVehiculoInfo> = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA === '1') {
      this.infoVehiculo = msRespose.data;
      this.infoVehiculo2 = msRespose.data;
      this.ignicion = this.infoVehiculo[0].ignicion_ult_act;
    } else {
      this.infoVehiculo = [];
    }
    this.showInfo = true;
  }

  onBtnExport() {
    TorreControlInstance.$emit('exportCsv', this.patente);
  }

  getCertification() {
    TorreControlInstance.$emit('openCertificate', {
      dataTable: this.dataTable,
      infoVehiculo: this.infoVehiculo[0],
      patente: this.patente,
    });
  }
}
</script>

<style scoped>
#btnExportCsv {
  height: auto;
}

.container-custom {
  width: 100%; /* Puedes ajustar este valor según tus necesidades */
  margin: 0 auto;
}

.v-card {
  display: inline-block;
  word-wrap: break-word;
}

.no-bg {
  -webkit-box-shadow: none !important;
}
</style>
