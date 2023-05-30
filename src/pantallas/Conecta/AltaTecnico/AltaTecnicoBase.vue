<template>
  <div class="resportesserie">
    <div class="flex sm12 md12">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm4 md4>
              <v-text-field
                style="margin-right:5px;"
                label="Buscar..."
                append-icon="search"
                v-model="filtrobusquedagrilla"
                @input="searchData"
              ></v-text-field>
            </v-flex>
            <v-flex sm3 md3 align="rigth"> </v-flex>
            <v-flex sm2 md2 align="rigth"> </v-flex>
            <v-flex sm3 md3 align="rigth">
              <v-btn
                style="padding-right:20px; padding-right: 20px; display: block; margin: 0 0 0 auto; margin-top: 15px"
                color="#ffe800"
                @click="crear_estado"
              >
                <v-icon dark left style="color: black;"
                  >add_circle_outline</v-icon
                >
                <span style="color: black;">Crear</span>
              </v-btn>
            </v-flex>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>

    <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>

    <VerCrearModal
      v-if="dialog"
      @cerrarCrear="handleCierreModalCrear"
      :total="total"
    />
    <VerEditarModal
      v-if="editarModal"
      @cerrar="handleCierreModalEditar"
      :id="id"
      :nombre="nombre"
      :apellido="apellido"
      :email="email"
      :direccion="direccion"
      :tel="tel"
      :localidad="localidad"
      :bodega="bodega"
      :tipoubicaid="tipoubicaid"
      :locaid2="locaid2"
      :estado="estado"
    />
    <app-confirmacion
      :show="dialogConfirmacion"
      :nombre="nombre"
      :titulo="'Dar Baja a ' + nombre"
      :mensaje="$t('Despúes de realizada la acción no se podrá reversar.')"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionEliminado"
      :nombre="nombre"
      :fecha="fecha"
      :titulo="nombre"
      :mensaje="$t('El Tecnico ya ha sido dado de baja el día ' + fecha)"
      v-on:modalConfirmationEmit="confirmCallbackAceptar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
    ></app-confirmacion>
  </div>
</template>
<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
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
} from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import showImage from '@/pantallas/Camaras/Alertas/showImage.vue';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import VerCrearModal from './VerCrearModal.vue';
import VerEditarModal from './VerEditarModal.vue';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { actionsEvent } from '@/setup';
import Confirmation from '@/components/Confirmation.vue';
import moment from 'moment';
@Component({
  components: {
    MantenedorGridSinCodigo,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    WidgetAlerta,
    showImage,
    FormFieldsContainer,
    DatePicker,
    VerCrearModal,
    VerEditarModal,
    'app-confirmacion': Confirmation,
  },
})
export default class AltaTecnicoBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.AltaTecnico;
  dialogConfirmacion: boolean = false;
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  dialog: boolean = false;
  editarModal: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  reporteSeleccionado: Number = null;
  serieNumeroSeleccionado: string = null;
  tipoEquipoSeleccionado: string = null;
  serieactivanroSeleccionado: string = null;
  showReporteGenerado: boolean = false;
  tipoeqid: any = '';
  pagina: number = 1;
  dialogConfirmacionEliminado: boolean = false;
  columnApi: any = null;
  gridEvent: any = null;
  serverSide: any;
  gridApi: GridApi = null;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  ordesList: any[] = [];
  usuarioID: any = '';
  hashpaginacion: string = '';
  rowcount: number = 0;
  total_registros: number = 0;
  cant_regs_pag: number = 25;
  total: any = '';
  fecha: any = '';
  estadoactual: any = '';
  tecnicoid: any = '';
  id: any = '';
  nombre: any = '';
  apellido: any = '';
  email: any = '';
  direccion: any = '';
  tel: any = '';
  localidad: any = '';
  bodega: any = '';
  tipoubicaid: any = '';
  locaid2: any;

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'tipoubicaid',
        field: 'tipoubicaid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
        hide: true,
        lockVisible: true,
      },
      {
        headerName: 'Id',
        field: 'tecnicoid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Nombre',
        field: 'tecniconame',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Apellido',
        field: 'tecnicoapellido',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Dirección',
        field: 'tecnicodireccion',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Email',
        field: 'tecnicomail',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Tel',
        field: 'tecnicotel',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Locaid',
        field: 'locaid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        lockVisible: true,
        width: 215,
        hide: true,
      },
      {
        headerName: 'Localidad',
        field: 'locaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Ubicación',
        field: 'tipoubicaname',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Fecha de Alta',
        field: 'fecha_alta_tecnico',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        headerName: 'Estado',
        field: 'estado',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        cellRenderer: params => {
          if (params.data.estado == 'Activo') {
            return (
              '<i class="material-icons" title="Vigente" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(42, 255, 78)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Activo' +
              '</a>'
            );
          } else {
            return (
              '<i class="material-icons" title="Anulado" style="width: 15px; height: 15px;margin-top: 7px; border-radius: 50%; background: rgb(255, 58, 58)"></i>' +
              '<a style="color: #4f4f4f; position: absolute; margin-top: 0%; margin-left: 3%">' +
              'Dado de baja' +
              '</a>'
            );
          }
        },
      },
      {
        headerName: 'Fecha de Baja',
        field: 'fecha_baja_tecnico',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };
  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.ordesList = await this.getReportes();
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }
  async getReportes() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'AltaTecnico')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.total = data.data.data.LISTA.length + 1;
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  crear_estado() {
    this.total;
    this.dialog = true;
  }
  async handleCierreModalCrear() {
    this.dialog = false;
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
  }

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }
  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }
  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      let self = this;
      this.loadingService.showLoading();
      return fetchReportesSerie(
        {
          usuarioid_modifica: JSON.parse(localStorage.getItem('user')).id,
          usuariorut_modifica: JSON.parse(localStorage.getItem('user'))
            .rutClienteDefecto,
          TECNICO: this.tecnicoid,
          modulo: this.funcionalidad,
        },
        'AltaTecnico/baja_tecnico'
      )
        .then(async (data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            this.ordesList = await this.getReportes();
            this.gridApi.setRowData(this.ordesList);
            self.$snotify.success(data.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
          } else {
            self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          }
        })
        .catch((error: any) => {
          self.$snotify.error('Ocurrió un error', { timeout: 3000 });
        })
        .finally(() => {
          this.loadingService.hideLoading();
          return null;
        });
    }
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.$validator.reset();
    if (value) {
      this.loadingService.showLoading();
      this.loadingService.hideLoading();
    }
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'Eliminar el Tecnico',
    });
  }
  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerEditarClick);
    actionsEvent.onEliminar(this.handleElminar);
  }

  async handleElminar(params: ICellRendererParams) {
    this.estadoactual = params.data.estado;
    if (this.estadoactual != 1) {
      this.nombre = params.data.tecniconame;
      this.dialogConfirmacion = true;
      this.tecnicoid = params.data.tecnicoid;
    } else {
      this.fecha = moment(params.data.fecha_baja_tecnico).format('YYYY-MM-DD');
      this.nombre = params.data.tecniconame;
      this.dialogConfirmacionEliminado = true;
    }
  }

  confirmCallbackAceptar(val: boolean) {
    this.dialogConfirmacionEliminado = false;
  }
  estado: any;
  handleVerEditarClick(params: ICellRendererParams) {
    console.log(params.data.locaid);
    this.id = params.data.tecnicoid;
    this.nombre = params.data.tecniconame;
    this.apellido = params.data.tecnicoapellido;
    this.email = params.data.tecnicomail;
    this.direccion = params.data.tecnicodireccion;
    this.tel = params.data.tecnicotel;
    this.localidad = params.data.locaname;
    this.bodega = params.data.tipoubicaname;
    this.tipoubicaid = params.data.tipoubicaid;
    this.locaid2 = params.data.locaid;
    this.estado = params.data.estado;
    this.editarModal = true;
  }
  async handleCierreModalEditar() {
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
    this.editarModal = false;
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

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

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEditar,
    this.accionEliminar,
  ];
  searchData() {
    this.gridApi.setQuickFilter(this.filtrobusquedagrilla);
    this.gridApi.setDomLayout('autoHeight');
  }
  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
  }
  async fetchRequermientosWidgets() {
    this.loadingService.showLoading();
  }
  filtros2body() {
    let body: any = {};

    return body;
  }
}
</script>
<style scope>
.AltaTecnicoConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.AltaTecnicoConecta div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.AltaTecnicoConecta
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.resportesserie .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
