<template>
  <ContainerPage title="Clasificacion Patentes Camaras">
    <v-container fluid>
      <v-layout align-end justify-end row fill-height>
        <v-flex md1>
          <div>
            <ClasificacionPatenteModal
              ref="clasificacionPatenteModal"
              v-if="dataGrid"
              :dataGrid="dataGrid"
              :triggerDialogOpen="triggerDialogOpen"
              :isConfiguration="false"
            ></ClasificacionPatenteModal>
          </div>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        <v-flex xs12 sm5 md3>
          <v-switch v-model="whitSchema" :label="labelSwitch"></v-switch>
        </v-flex>
        <v-flex xs12 sm5 md3 offset-xs0 offset-lg6>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md12 grow pa-1>
          <ClasificacionPatenteTable
            :isClasificated="whitSchema"
            :config="configTable"
            :dataTable="dataTable"
            :search="search"
            :isConfiguration="false"
            @clasificate="clasificate"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </ContainerPage>
</template>

<script lang="ts">
import ContainerPage from '@/components/ContainerPage.vue';
import { Component, Watch } from 'vue-property-decorator';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { configTable } from './ClasificacionPatentesHeaders';
import { Funcionalidades } from '@/config/funcionalidades';
import { ClasificacionPatentes } from './ClasificacionPatentesService';
import { MSResponse } from '@/interfaces/MS';
import { CamaraRelacionadaI, FlotasI } from './ClasificacionPatentesInterfaces';
import { AxiosResponse } from 'axios';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import CrearButton from '@/reusable/Grid/CrearButton.vue';
import ClasificacionPatenteModal from './ClasificacionPatenteModal.vue';
import { LoadingService } from '@/services/loadingService';
import ClasificacionPatenteTable from './ClasificacionPatenteTable.vue';

@Component({
  components: {
    ContainerPage,
    CrearButton,
    ClasificacionPatenteModal,
    ClasificacionPatenteTable,
  },
})
export default class ClientesConecta extends ComponenteBase {
  accionesTotales: PermisoAccion[];
  loadingService = new LoadingService();
  configTable = { ...configTable };
  dataTable: CamaraRelacionadaI[] = [];
  triggerDialogOpen: boolean = false;

  readonly funcionalidad: Funcionalidades =
    Funcionalidades.ClasificacionPatentes;

  clasificacionPatentes = new ClasificacionPatentes();

  whitSchema = false;
  labelSwitch = 'Camaras sin clasificar.';
  search = '';

  dataGrid: CamaraRelacionadaI = {
    id_camara: '',
    patente: '',
    marca: '',
    modelo: '',
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: true,
  };
  data() {
    return {
      dialog: false,
    };
  }

  mostrarModalCrear: boolean = false;

  constructor() {
    super();
  }

  created() {
    this.getAlarma();
  }

  async getAlarma(whitSchema = false) {
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<CamaraRelacionadaI>
    > = await this.clasificacionPatentes.getAlarmas(whitSchema);
    const msResponse: MSResponse<CamaraRelacionadaI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA === '1') {
      this.dataTable = msResponse.data;
    } else {
      //TODO agregar notificacion notify
      this.dataTable = [];
    }
    this.loadingService.hideLoading();
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModal() {
    this.mostrarModalCrear = false;
  }

  clasificate(item: any) {
    this.dataGrid = item;
    this.triggerDialogOpen = !this.triggerDialogOpen;
  }

  @Watch('whitSchema')
  watchWhitSchema() {
    this.labelSwitch = this.whitSchema
      ? 'Camaras clasificadas.'
      : 'Camaras sin clasificar';
    this.configTable.headers = [...configTable.headers];
    /*if (this.whitSchema) {
      this.configTable.headers = this.configTable.headers.filter(
        config => config.text !== 'Acciones'
      );
    } else {
      this.configTable.headers = [...configTable.headers];
    }*/
    this.getAlarma(this.whitSchema);
  }
}
</script>

<style scoped>
.boton {
  background-color: #ffe800 !important;
}
</style>
