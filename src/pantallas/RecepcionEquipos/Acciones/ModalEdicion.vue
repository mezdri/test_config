<template>
  <v-dialog
    v-model="modalEsEdicion"
    max-width="600px"
    transition="dialog-bottom-transition"
    persistent
  >
    <v-container fluid white>
      <v-form v-model="validForm">
        <FormFieldsContainer>
          <v-flex sm12 md12 layout wrap>
            <v-flex xs6 sm6 md6>
              <v-text-field
                class="mr-2"
                :label="formFields.rack.label"
                v-model="formFields.rack.value"
                :rules="[rules.counter]"
                counter="10"
              ></v-text-field>
            </v-flex>
            <v-flex xs6 sm6 md6>
              <v-text-field
                class="ml-2"
                :label="formFields.bloque.label"
                v-model="formFields.bloque.value"
                :rules="[rules.counter]"
                counter="10"
              ></v-text-field>
            </v-flex>
          </v-flex>
        </FormFieldsContainer>
      </v-form>
      <div class="">
        <v-layout row wrap class="mt-3">
          <v-flex xs6 sm6 md7></v-flex>
          <v-flex xs4 sm4 md5 style="text-align: end">
            <v-btn class="btn-volver white--text" @click="cerrarModal()"
              >Cancelar</v-btn
            >
            <v-btn
              class="btn-grabar white--text"
              @click="guardar()"
              :disabled="!validForm"
              >Guardar</v-btn
            >
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </v-dialog>
</template>
<script lang="ts">
import moment from 'moment';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import config from '@/config/index';
import { Component, Prop } from 'vue-property-decorator';
import { IFuncionalidad } from '@/interfaces/Funcionalidad';
import { actionsEvent } from '@/setup';
import { Accion } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import Confirmation from '@/components/Confirmation.vue';
import HandleErrors from '@/config/handleErrors';
import store from '@/store';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
} from 'ag-grid-community';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchRecepcion } from '../fetchRecepcion';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import Dispositivo from '../Dispositivos/Dispositivo.vue';
import { forEach } from 'lodash';
import {
  checkboxColumnDef,
  makeAccionesColumnDef,
} from '@/reusable/Grid/aggridColumnDefUtils';

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    MantenedorGrid,
    FormFieldsContainer,
  },
})
export default class ModalEdicion extends ComponenteBase {
  @Prop({ required: true }) tipo: string;
  @Prop({ required: true }) edited: any;
  @Prop({ required: true }) codigo: number;
  @Prop({ default: false }) dataSelected: any;
  @Prop({ default: false }) modalEsEdicion: boolean;
  validForm: boolean = true;

  rules = {
    counter: (value: any) => value.length <= 10 || 'Maximo 10 caracteres',
  };

  accionesTotales: PermisoAccion[];
  ordesList: any[] = [];

  funcionalidad: Funcionalidades = Funcionalidades.TablasRecepcionEquipos;
  usuario = JSON.parse(localStorage.getItem('user')).id;

  formFields: FormFieldDefMap = {
    rack: {
      label: 'Rack',
      id: '',
      value: '',
    },
    bloque: {
      label: 'Bloque',
      id: '',
      value: '',
    },
  };

  cerrarModal() {
    this.$emit('cerrarModal', false);
  }

  finales: any;

  async getRackBloque(data: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchRecepcion(
      { tipo: this.tipo, id: data, movimiento: this.codigo },
      'conecta_recepcion_equipos/get_rack_bloque'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
        } else {
          //self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error(error, { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async cargarInfo(edite: any) {
    let data = await this.getRackBloque(edite);
    if (this.tipo == 'noseriado') {
      this.formFields.rack.value = data.movinoserierack;
      this.formFields.bloque.value = data.movinoseriebloque;
    } else {
      this.formFields.rack.value = data.moviserierack;
      this.formFields.bloque.value = data.moviseriebloque;
    }
  }

  async gardarDatos() {
    let self = this;
    return fetchRecepcion(
      {
        tipo: this.tipo,
        id: this.edited,
        movimiento: this.codigo,
        rack: this.formFields.rack.value,
        bloque: this.formFields.bloque.value,
      },
      'conecta_recepcion_equipos/actualizar_rack_bloque'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data;
        } else {
          //self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error(error, { timeout: 3000 });
      })
      .finally(() => {
        return null;
      });
  }

  async guardar() {
    let guardar = await this.gardarDatos();
    this.$emit('actualizarTabla', false);
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  selectedRows: any = [];

  onSelectionChanged(params: any) {
    this.selectedRows = this.gridApi.getSelectedRows();
  }

  // Globales
  tabModel: string = 'tab-3';
  muestraBarraBotones: boolean = false;
  registrosAsociar: any = [];
  rowsPerPageItems: any = [];
  dialog: Boolean = false;
  search: string = '';
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  showTabPerfiles: boolean = true;
  showTabRoles: boolean = true;
  loadingService = new LoadingService();
  paramsExportar: any; //Parametros para Exportar
  intervalo: any; //Intervalo para el buscador
  chequearPermisosBtnCrear: boolean = true;
  editedIndex: number = -1;
  nombreModulo: string = '';
  handleErrors: HandleErrors = new HandleErrors();

  // Controller
  readonly controller: string = 'funcionalidad';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Grilla
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  agGridUtil: AgGridUtil;
  serverSide: any;

  // Interfaces
  editedItem: IFuncionalidad = {};
  funcionalidades: Array<IFuncionalidad> = [];

  //vuex
  usuarioId: number = store.state.userId;

  moduloModalCallback(val: boolean) {
    //this.showModalEdit = val;
  }
}
</script>
