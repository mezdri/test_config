<template>
  <div class="reportes-localidad">
    <div class="flex sm12 m12">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap justify-space-between mb-4>
          <v-flex xs12 sm6 md6>
            <v-text-field
              style="margin-right:5px;"
              label="Buscar..."
              append-icon="search"
              v-model="filtrobusquedagrilla"
              @input="handleSearch"
            />
          </v-flex>

          <v-flex class=" xs12 sm6 md6 layout-flex-localidad">
            <v-btn @click="handleAdd" class="btn-guardar">
              <v-icon class="mr-2">add_circle_outline</v-icon>
              Crear
            </v-btn>
          </v-flex>
        </v-flex>
      </FormFieldsContainer>

      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />

      <app-confirmacion
        :show="dialogEliminar"
        :titulo="'Eliminar Localidad'"
        :mensaje="`¿Estás Seguro de que deseas eliminar a ${data.locaname}?`"
        v-on:modalConfirmationEmit="handleDeleteLocalidad($event)"
        :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
        :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
      >
      </app-confirmacion>

      <ModalViewLocalidad
        v-if="showModal"
        @cerrar="handleClosedModal"
        :data="data"
        :anulado="anulado"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import WidgetAlerta from '@/pantallas/Camaras/Alertas/WidgetAlerta.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ColumnApi,
} from 'ag-grid-community';

import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchMantenedorLocalidad } from './fetchMantenedorLocalidad';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { actionsEvent } from '@/setup';
import Confirmation from '@/components/Confirmation.vue';

import ModalViewLocalidad from './ModalViewLocalidad.vue';
import { getUserId } from './helpers/getUserId';

@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    WidgetAlerta,
    showImage,
    FormFieldsContainer,
    DatePicker,
    'app-confirmacion': Confirmation,
    ModalViewLocalidad,
  },
})
export default class MantenedorLocalidadBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.localidad;
  loadingService = new LoadingService();
  columnApi: any = null;
  gridEvent: any = null;
  gridApi: GridApi = null;
  ordesList: any[] = [];
  data: any = {};
  filtrobusquedagrilla: string = '';
  dialogEliminar: boolean = false;
  showModal: boolean = false;
  anulado: boolean = false;

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEdit);
    actionsEvent.onEliminar(this.handleDelete);
  }

  async recargarGrilla() {
    this.ordesList = await this.getLocalidades();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.data = {};
  }

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionEditar, this.accionEliminar];

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Localidad',
        field: 'locaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 330,
      },
      {
        headerName: 'Fecha Alta',
        field: 'locafecha_alta',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 330,
        cellRenderer: (param: any) =>
          param.data.locafecha_alta.substring(0, 19),
      },
      {
        headerName: 'Estado',
        field: 'locabaja',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 330,
        cellRenderer: (params: any) => {
          if (params.data.locabaja == 'Vigente') {
            return `<i class="material-icons"  style="width: 15px; height: 15px; margin-top: 7px; border-radius: 50%; background: rgb(42, 255, 78);"></i>
               <a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">${params.data.locabaja}</a>
              `;
          } else {
            return `<i class="material-icons"  style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(255, 58, 58)"></i>
               <a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">${params.data.locabaja}</a>
              `;
          }
        },
      },
    ],
    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getLocalidades();
    this.gridApi = event.api;
    this.columnApi = event.columnApi;
    this.gridEvent = event;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }

  handleSearch() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }

  handleAdd(event: any) {
    this.showViewModal(event, true);
  }

  handleEdit(event: any) {
    this.showViewModal(event);
  }

  showViewModal(params: ICellRendererParams, addLocalidad: boolean = false) {
    if (addLocalidad) {
      this.data = {};
      this.anulado = false;
    } else if (params.data.locabaja !== 'Vigente') {
      this.data = params.data;
      this.anulado = true;
    } else {
      this.data = params.data;
      this.anulado = false;
    }
    this.showModal = true;
  }

  handleClosedModal() {
    this.showModal = false;
    this.recargarGrilla();
    this.data = {};
  }

  handleDelete(event: any) {
    this.data = event.data;
    this.dialogEliminar = true;
  }

  handleDeleteLocalidad(event: any) {
    this.dialogEliminar = false;
    if (event) {
      this.deleteLocalidad(this.data);
    }
  }

  async getLocalidades() {
    let self = this;
    this.loadingService.showLoading();
    return fetchMantenedorLocalidad(
      { ClienteDefecto: JSON.parse(localStorage.getItem('clienteDefecto')) },
      'api_localidad/get_localidades'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          return [];
        }
        self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  async deleteLocalidad(params: any) {
    const { locaid, locaname } = params;
    let self = this;
    this.loadingService.showLoading();
    return fetchMantenedorLocalidad(
      {
        locaid: Number(locaid),
        locaname: locaname,
        usuarioid_modifica: getUserId(),
        usuariorut_modifica: localStorage.getItem('clienteDefecto'),
      },
      'api_localidad/delete_localidad'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.gridApi.setRowData((this.ordesList = []));
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(async () => {
        this.loadingService.hideLoading();
        this.recargarGrilla();
      });
  }
}
</script>

<style>
.configurar-localidad-conecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}

.configurar-localidad-conecta
  div.ag-layout-auto-height:nth-child(3)
  > div:nth-child(1) {
  display: none;
}

.configurar-localidad-conecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}

.reportes-localidad .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}

.btn-guardar {
  background-color: #ffe800 !important;
  border-color: #ffe800 !important;
  padding-right: 20px;
}

.layout-flex-localidad {
  display: flex;
  justify-content: end;
  align-items: center;
}

@media (max-width: 600px) {
  .layout-flex-localidad {
    justify-content: center;
  }
}
</style>
