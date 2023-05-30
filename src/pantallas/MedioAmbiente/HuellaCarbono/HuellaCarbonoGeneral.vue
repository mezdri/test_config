<template>
  <div>
    <CreateEditModalMedioAmbiente
      :show="showModal"
      :modal_action="modalAction"
      :modal_title="modalTitle"
      :parametros="selectedRow"
      @closeModal="handleCloseModal"
    />
    <v-layout row wrap style="padding-right:0px; margin-top: 15px">
      <v-flex sm12 md12 layout wrap>
        <v-flex sm3 md3>
          <v-text-field
            v-model="searchModel"
            @input="searchData"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </v-flex>
        <v-flex sm3 md3></v-flex>
        <v-flex sm3 md3></v-flex>
        <v-flex
          sm3
          md3
          style="display: flex; align-items: flex-end; justify-content: flex-end;"
        >
          <v-btn
            v-if="accionCrear.visible"
            style="height: 48px;"
            color="#ffe800"
            @click="handleModal('create')"
          >
            <v-icon
              dark
              left
              style="font-size: 160%; margin-right: 7% !important;"
              >add_circle_outline</v-icon
            >
            <span>Crear Vehículo</span>
          </v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
    <v-container fluid grid-list-md>
      <v-container fluid grid-list-md>
        <Datatables :headers="headers" :dataTable="dataTable" />
      </v-container>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import {
  PermisoAccion,
  codigoAccionesMenuItem,
} from '@/views/base/VariablesPermisos';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { MSResponse } from '@/interfaces/MS';
import { AxiosResponse } from 'axios';
import Datatables from '@/pantallas/MedioAmbiente/DataTable.vue';
import { headers } from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbonoheaders';
import { HuellaCarbonoService } from '@/pantallas/MedioAmbiente/HuellaCarbono/HuellaCarbonoService';
import MedioAmbienteInstance from '@/pantallas/MedioAmbiente/comunes/Instances';
import CreateEditModalMedioAmbiente from '@/pantallas/MedioAmbiente/HuellaCarbono/CreateEditModalMedioAmbiente.vue';
import { actionsEvent } from '@/setup';

@Component({
  name: 'HuellaCarbonoGeneral',
  components: {
    Datatables,
    CreateEditModalMedioAmbiente,
  },
})
export default class HuellaCarbonoGeneral extends ComponenteBase {
  loadingService = new LoadingService();
  huellaCarbonoService = new HuellaCarbonoService();
  tabSelected: number = 1;
  clientId: string;
  flotaId: string;
  isLoading: boolean = false;
  dataTable: any = [];
  headers = headers;
  readonly funcionalidad: Funcionalidades = Funcionalidades.MedioAmbiente;
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  showModal: boolean = false;
  modalAction: string = '';
  modalTitle: string = '';
  selectedRow: any = {};
  userId: string;
  searchModel: string = '';
  intervalo: any; //Intervalo para el buscador

  detalleSeleccionado: any = null;

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };
  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEditar,
  ];

  constructor() {
    super();
    this.getClientId();
    actionsEvent.onEditar(this.handleEditCommand);
  }

  getClientId() {
    this.flotaId = this.$route.params.id;
    this.clientId = localStorage.getItem('clienteDefecto');
    let user: any = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    this.userId = id.toString();
  }

  async mounted() {
    // this.getData();
  }

  handleModal(type: string) {
    switch (type) {
      case 'create': {
        this.modalAction = 'crear';
        this.modalTitle = 'Crear Vehículo';
        break;
      }
      case 'edit': {
        this.modalAction = 'editar';
        this.modalTitle = 'Editar Vehículo';
        break;
      }
      default: {
        break;
      }
    }
    this.showModal = true;
  }
  handleCloseModal() {
    this.showModal = false;
  }

  handleEditCommand(params: any) {
    this.selectedRow = params.data;
    this.handleModal('edit');
  }

  searchData() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.searchModel.length >= 2) {
        MedioAmbienteInstance.$emit('onFilterChanged', self.searchModel);
      } else if (self.searchModel.length === 0) {
        MedioAmbienteInstance.$emit('setServerSideDatasource');
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  /*async getData() {
    this.isLoading = true;
    this.loadingService.showLoading();
    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.huellaCarbonoService.get_data_general(this.clientId, '');
    this.isLoading = false;
    const msRespose: MSResponse<any> = axiosResponse.data;
    if (msRespose.CODIGO_RESPUESTA === '1') {
      this.dataTable = msRespose.data;
      MedioAmbienteInstance.$emit('dataTable', this.dataTable);
    } else {
      this.dataTable = [];
    }
    this.loadingService.hideLoading();
  }*/
}
</script>

<style scoped></style>
