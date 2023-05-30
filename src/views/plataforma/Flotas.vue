<template>
  <v-container fluid grid-list-md>
    <v-tabs left v-model="tabModel" color="transparent">
      <v-tab v-if="showTabVehiculos" :href="`#tab-2`" to="/vehiculos"
        >Vehículos</v-tab
      >
      <v-tab :href="`#tab-1`">Flotas</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-layout row wrap style="padding-right:0px">
      <v-flex xs12 sm6 md6>
        <div align="left">
          <v-text-field
            @input="onFilterTextBoxChanged"
            v-model="search"
            append-icon="search"
            label="Buscar..."
            single-line
            hide-details
          ></v-text-field>
        </div>
      </v-flex>
      <v-flex xs12 sm6 :md4="accionCrear.visible" :md6="!accionCrear.visible">
        <div align="right" style="padding-top:15px">
          <v-btn
            v-if="accionExportar.visible"
            flat
            small
            color="primary"
            @click="exportar()"
          >
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar</span>
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm6 md2 style="padding-right:0px;">
        <div align="right" style="padding-top:6px;padding-right:0px;">
          <v-btn
            v-if="accionCrear.visible"
            class="btn-crear"
            @click="(editedItem = {}), (showModalNew = true)"
            style="padding-right:20px;"
          >
            <v-icon dark left style="color=black;">add_circle_outline</v-icon>
            <span>Crear </span>
          </v-btn>
        </div>
      </v-flex>
    </v-layout>

    <div v-if="accionEliminar.visible">
      <v-layout
        row
        wrap
        v-if="muestraBarraBotones"
        class="animated fadeIn fast"
      >
        <v-flex md3>
          <v-btn flat small class="btn-barra" @click="eliminarSeleccionadas">
            <v-icon>delete</v-icon>&nbsp;&nbsp;Eliminar Seleccionadas
          </v-btn>
        </v-flex>
      </v-layout>
    </div>

    <v-divider></v-divider>

    <div class="gridcard rounded-card">
      <ag-grid-vue
        style="width: 100%; height: 400px; font-family: 'Asap', sans-serif;"
        class="ag-theme-material"
        :gridOptions="gridOptions"
      ></ag-grid-vue>
    </div>
    <!-- <app-confirmacion
                :show="dialogEliminar"
                titulo="Eliminar Flota"
                mensaje="¿Esta seguro que desea eliminar esta(s) Flota(s)?"
                v-on:modalConfirmationEmit="deleteItemCallback($event)"
                textoBtnSi="Aceptar"
                textoBtnNo="Cancelar">
    </app-confirmacion>-->
    <app-confirmacion
      :show="dialogEliminar"
      :titulo="tituloFlotaMensaje"
      :mensaje="eliminarFlotaMensaje"
      v-on:modalConfirmationEmit="deleteItemCallback($event)"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></app-confirmacion>
    <app-nueva-flota
      :show="showModalNew"
      :flota="editedItem"
      v-on:modalAsociacionEmit="flotaModalCallback($event)"
    ></app-nueva-flota>
    <app-edicion-flota
      :show="showModalEdit"
      :esEdicion="modalEsEdicion"
      :flota="editedItem"
      v-on:modalAsociacionEmit="flotaModalCallback($event)"
    ></app-edicion-flota>
    <app-desasociar-vehiculos
      :show="dialogDesasociarVehiculos"
      :flota="editedItem"
      v-on:modalAsociacionEmit="flotaDesasociarCallback($event)"
    ></app-desasociar-vehiculos>
    <div class="text-xs-center">
      <v-dialog v-model="dialogConfirmaEliminar" persistent :max-width="480">
        <v-card id="alinear">
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Eliminar Flota: {{ editedItem.nombre }}</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <!-- 1 Vehículo y 1 Subflota -->
          <v-card-text
            v-if="
              cantidadVehiculosAsociados === 1 &&
                cantidadSubFlotasAsociadas === 1
            "
          >
            <span justified>
              La Flota tiene un Vehículo y una Subflota asociada, para realizar
              la eliminación primero debe desasociar el Vehículo y la Subflota.
              ¿Desea desasociarlos?
            </span>
          </v-card-text>
          <!-- 1 Vehículo y +1 Subflotas-->
          <v-card-text
            v-else-if="
              cantidadVehiculosAsociados === 1 && cantidadSubFlotasAsociadas > 0
            "
          >
            <span justified>
              La Flota tiene un Vehículo y
              {{ cantidadSubFlotasAsociadas }} Subflotas asociadas, para
              realizar la eliminación primero debe desasociar el Vehículo y las
              Subflotas. ¿Desea desasociarlos?
            </span>
          </v-card-text>
          <!-- +1 Vehículo y 1 Subflota -->
          <v-card-text
            v-else-if="
              cantidadVehiculosAsociados > 0 && cantidadSubFlotasAsociadas === 1
            "
          >
            <span justified>
              La Flota tiene {{ cantidadVehiculosAsociados }} Vehículos y una
              Subflota asociada, para realizar la eliminación primero debe
              desasociar los Vehículos y la Subflota. ¿Desea desasociarlos?
            </span>
          </v-card-text>
          <!-- +1 Vehículo y +1 Subflotas -->
          <v-card-text
            v-else-if="
              cantidadVehiculosAsociados > 0 && cantidadSubFlotasAsociadas > 0
            "
          >
            <span justified>
              La Flota tiene {{ cantidadVehiculosAsociados }} Vehículos y
              {{ cantidadSubFlotasAsociadas }} Subflotas asociadas, para
              realizar la eliminación primero debe desasociar los Vehículos y
              las Subflotas. ¿Desea desasociarlos?
            </span>
          </v-card-text>
          <!-- 1 Vehículo -->
          <v-card-text v-else-if="cantidadVehiculosAsociados === 1">
            <span justified>
              La Flota tiene un Vehículo asociado, para realizar la eliminación
              primero debe desasociar el Vehículo. ¿Desea desasociarlo?
            </span>
          </v-card-text>
          <!-- +1 Vehículo -->
          <v-card-text v-else-if="cantidadVehiculosAsociados > 0">
            <span justified>
              La Flota tiene {{ cantidadVehiculosAsociados }} Vehículos
              asociados, para realizar la eliminación primero debe desasociar
              los Vehículos. ¿Desea desasociarlos?
            </span>
          </v-card-text>
          <!-- 1 Subflota -->
          <v-card-text v-else-if="cantidadSubFlotasAsociadas === 1">
            La Flota tiene una Subflota asociada, para realizar la eliminación
            primero debe desasociar la Subflota. ¿Desea desasociarla?
          </v-card-text>
          <!-- +1 Subflota -->
          <v-card-text v-else-if="cantidadSubFlotasAsociadas > 0">
            La Flota tiene {{ cantidadSubFlotasAsociadas }} Subflotas asociadas,
            para realizar la eliminación primero debe desasociar las Subflotas.
            ¿Desea desasociarlas?
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              color="white"
              depressed
              small
              @click="dialogConfirmaEliminar = false"
              ><span style="color: #526da5">Cancelar</span></v-btn
            >
            <v-btn
              small
              color="primary"
              @click="
                dialogDesasociarVehiculos = true;
                dialogConfirmaEliminar = false;
              "
              >Desasociar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog
        v-model="dialogConfirmacionDespuesDeDesasociar"
        persistent
        max-width="480"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Eliminar Flota: {{ editedItem.nombre }}</v-toolbar-title
            >
          </v-toolbar>
          <v-card-text
            >La Flota ya no posee Vehículos ni Subflotas asociadas. ¿Desea
            eliminar la Flota de forma definitiva?</v-card-text
          >
          <v-card-text
            >Si cancela esta acción, los cambios realizados no serán
            guardados.</v-card-text
          >
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              depressed
              small
              color="white"
              @click="dialogConfirmacionDespuesDeDesasociar = false"
              ><span style="color: #526da5">Cancelar</span></v-btn
            >
            <v-btn small color="primary" @click="eliminarFlota()"
              >Eliminar Flota</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog
        v-model="dialogEliminacionMasivaValida"
        persistent
        max-width="480"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >{{ tituloModalEliminar }}
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text
            v-if="
              cantidadVehiculosEliminaMasivo > 0 &&
                cantidadSubflotasEliminaMasivo > 0
            "
          >
            <span>{{ tituloAsociadasEliminar }}</span>
            <br />
            <span>
              Las Flotas se encuentran asociadas a
              {{
                cantidadVehiculosEliminaMasivo > 1
                  ? cantidadVehiculosEliminaMasivo + ' Vehículos y '
                  : ' un Vehículo y '
              }}
              {{
                cantidadSubflotasEliminaMasivo > 1
                  ? cantidadSubflotasEliminaMasivo + ' Subflotas.'
                  : ' una Subflota.'
              }}
            </span>
          </v-card-text>
          <v-card-text v-else-if="cantidadVehiculosEliminaMasivo > 0">
            <span>{{ tituloAsociadasEliminar }}</span>
            <br />
            <span>
              Las Flotas se encuentran asociadas a
              {{
                cantidadVehiculosEliminaMasivo > 1
                  ? cantidadVehiculosEliminaMasivo + ' Vehículos.'
                  : ' un Vehículo.'
              }}
            </span>
          </v-card-text>
          <v-card-text v-else-if="cantidadSubflotasEliminaMasivo > 0">
            <span>{{ tituloAsociadasEliminar }}</span>
            <br />
            <span>
              Las Flotas se encuentran asociadas a
              {{
                cantidadSubflotasEliminaMasivo > 1
                  ? cantidadSubflotasEliminaMasivo + ' Subflotas.'
                  : ' una Subflota.'
              }}
            </span>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              small
              color="primary"
              @click="dialogEliminacionMasivaValida = false"
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div class="text-xs-center">
      <v-dialog v-model="dialogFlotaPorDefecto" persistent max-width="480">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >{{ tituloFlotaPorDefecto }}
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text
            >{{ mensajeFlotaPorDefecto }}
            <br v-if="flotasPorDefecto.length > 0" />
            <br v-if="flotasPorDefecto.length > 0" />
            <ul>
              <li v-for="item in flotasPorDefecto" :key="item">
                {{ item }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="dialogFlotaPorDefecto = false"
              >Aceptar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>
<script lang="ts">
import moment from 'moment';
import config from '@/config/index';
import store from '@/store';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import MenuItem from '@/components/MenuItem.vue';
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  EstadoCompartirInformacion,
  TipoCompartir,
} from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { FlotaInterface } from '@/interfaces/Flota';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { eventBus, actionsEvent } from '@/setup';
import { EstadoEntidad, Accion } from '@/config/enums';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import ConfigurarVistaActual from '@/components/mantenedores/ConfigurarVistaActual.vue';
import FlotasModalNuevo from '@/components/plataforma/FlotasModalNuevo.vue';
import FlotasModalEdicion from '@/components/plataforma/FlotasModalEdicion.vue';
import FlotasModalDesasociarVehiculos from '@/components/plataforma/FlotasModalDesasociarVehiculos.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { AgGridUtil } from '@/agGridUtil/agGridUtil';
import { EstadoGrillaVm } from '@/interfaces/EstadoGrillaVm';
import { LoadingService } from '@/services/loadingService';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  CsvExportParams,
  ProcessCellForExportParams,
} from 'ag-grid-community';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-menu-item': MenuItem,
    'app-confirmacion': Confirmation,
    'app-nueva-flota': FlotasModalNuevo,
    'app-edicion-flota': FlotasModalEdicion,
    'app-config-vista-actual': ConfigurarVistaActual,
    'app-desasociar-vehiculos': FlotasModalDesasociarVehiculos,
  },
})
export default class Flota extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Flotas;
  //Declarar todas las Acciones Mantenedores
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly controller: string = 'flota';

  showTabVehiculos: boolean = true;
  tabModel: string = 'tab-1';
  modalEsEdicion: boolean = false;
  localeText: any = config.agGridTextos;
  gridOptions: GridOptions;
  serverSide: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  detailCellRendererParams: any = null;
  agGridUtil: AgGridUtil;
  estadoGrillaVm: EstadoGrillaVm;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  showConfigVista: boolean = false;
  deleteMasivo: boolean = false;
  vehiculosAsociadosFlotas: any = [];
  cantidadVehiculosEliminaMasivo: number = 0;
  subflotasAsociadosFlotas: any = [];
  cantidadSubflotasEliminaMasivo: number = 0;
  dialogEliminacionMasivaValida: boolean = false;
  dialogConfirmaEliminar: boolean = false;
  dialogDesasociarVehiculos: boolean = false;
  dialogConfirmacionDespuesDeDesasociar: boolean = false;
  showModalNew: boolean = false;
  showModalEdit: boolean = false;
  showModalCambioEstado: boolean = false;
  muestraBarraBotones: boolean = false;
  columnasCambioEstado: CambioEstadoInterface[] = [];
  dataCambioEstado: any = [];
  eliminarFlotaMensaje: any = '';
  tituloFlotaMensaje: any = '';
  tituloModalEliminar: string = '';
  chequearPermisosBtnCrear: boolean = true;

  $snotify: any;
  search: string = '';
  flotas: FlotaInterface[] = [];
  dialogEliminar: Boolean = false;
  editedIndex: number = -1;
  editedItem: FlotaInterface = {};
  defaultItem: FlotaInterface = {};
  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  axiosGestionUsuarios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosClientes: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  axiosVehiculos: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);

  cantidadVehiculosAsociados: number = 0;
  cantidadSubFlotasAsociadas: number = 0;
  nombreFlotaEliminar: string = '';
  clienteId: number = config.getClienteSesion();

  vehiculosAsignados: IVehiculo[] = []; //any = [];
  subflotasAsignados: FlotaInterface[] = [];

  //Flotas por Defecto
  listadoFlotas: any[] = []; //Para validar la Flota por Defecto
  tituloFlotaPorDefecto: string = '';
  mensajeFlotaPorDefecto: string = '';
  flotasPorDefecto: any[] = [];
  dialogFlotaPorDefecto: boolean = false;
  esEliminar: boolean = true;
  //---
  paramsExportar: any; //Parametros para Exportar
  vehiculosCompartidos: any = [];
  intervalo: any; //Intervalo para el buscador

  //Valida Flota Compartida
  notificaEsCompartido: boolean = false;
  idCompartida: number = 0;
  //---

  //Ordenamiento + Seleccion
  valCheck: any[] = [];
  idFilasSeleccionadas: any = [];
  //---
  existeFlotaDestino: boolean = false;
  tituloAsociadasEliminar: string = '';

  constructor() {
    super();

    this.estadoGrillaVm = {
      id: 0,
      grilla: '',
      usuarioId: this.usuarioId,
      funcionalidades: this.funcionalidad,
    };

    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        suppressMenu: true,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: params =>
          this.chequearPermiso('Eliminar') === false
            ? { textAlign: 'center', 'pointer-events': 'none' }
            : { textAlign: 'center' },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: 'agGroupCellRenderer',
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        sortable: true,
        lockPinned: true,
        width: 205,
        minWidth: 80,
      },
      {
        headerName: 'Cliente',
        field: 'nombreCliente',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Responsable',
        field: 'responsableFlotaNombre',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Mantención',
        field: 'responsableMantenimientoFlotaNombre',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Vehículos',
        field: 'cantidadVehiculos',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Creado por',
        field: 'usuarioCreador',
        sortable: true,
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Fecha Creación',
        field: 'fechaCreacionTxt',
        width: 165,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Modificado por',
        field: 'usuarioModificacion',
        width: 170,
        minWidth: 80,
        sortable: true,
        resizable: true,
        lockPinned: true,
        filter: false,
      },
      {
        headerName: 'Última Modificación',
        field: 'fechaModificacionTxt',
        width: 180,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
        resizable: true,
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        resizable: true,
        width: 170,
        minWidth: 80,
        lockPinned: true,
        sortable: true,
      },
      {
        headerName: 'Acciones',
        field: 'id',
        cellRendererFramework: 'app-menu-item',
        cellRendererParams: {
          funcionalidad: this.funcionalidad,
          usuario: store.state.user,
          codigoAccionesMenuItem: this.codigoAccionesMenuItem,
        },
        colId: 'params',
        rowDrag: false,
        width: 120,
        minWidth: 120,
        pinned: 'right',
        resizable: false,
        sortable: false,
        enablePivot: false,
        lockVisible: true,
        suppressMovable: true,
      },
    ];

    //Grilla Vehículos
    this.detailCellRendererParams = {
      detailGridOptions: {
        localeText: config.agGridTextos,
        suppressCsvExport: true,
        suppressExcelExport: true,
        columnDefs: [
          {
            headerName: 'Unidad',
            field: 'unidad',
            enablePivot: false,
            lockPinned: true,
            resizable: true,
            sortable: false,
            width: 200,
            minWidth: 80,
            maxWidth: 200,
            lockVisible: true,
            filter: false,
            suppressMovable: true,
          },
          {
            headerName: '',
            cellRenderer: this.createButtonCellVehiculoCompartido,
            enablePivot: false,
            lockPinned: true,
            resizable: true,
            width: 90,
            minWidth: 90,
            maxWidth: 90,
            filter: false,
            lockVisible: true,
            cellStyle: { textAlign: 'left' },
          },
        ],
        /*onFirstDataRendered(params: any) {
          params.api.sizeColumnsToFit();
        },*/
      },
      getDetailRowData: (params: any) => {
        params.successCallback(params.data.vehiculos);
      },
    };

    this.gridOptions = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      columnDefs: this.columnDefs,
      rowModelType: 'serverSide',
      sideBar: this.sideBar,
      serverSideDatasource: this.serverSide,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
      blockLoadDebounceMillis: 350,
      onGridReady: this.onGridReady,
      onDragStopped: this.onDragStoppedEvent,
      onColumnVisible: this.onColumnVisibleEvent,
      onColumnPinned: this.onColumnPinnedEvent,
      onSelectionChanged: this.onSelectionChanged,
      masterDetail: true,
      suppressCopyRowsToClipboard: true,
      detailCellRendererParams: this.detailCellRendererParams,
      columnTypes: {
        fecha: {
          cellRenderer: this.fechaFilter,
          sortable: true,
          resizable: true,
          filter: false,
        },
      },
      suppressCsvExport: true,
      suppressExcelExport: true,
    };
  }

  createButtonCellVehiculoCompartido(params: any) {
    const vc: any = this.vehiculosCompartidos.find(
      (x: any) => x.id === params.data.id
    );
    if (vc !== undefined) {
      var eButton = document.createElement('i');
      eButton.setAttribute(
        'title',
        'Vehículo compartido por: ' + vc.compartidoPor
      );
      eButton.innerHTML =
        '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
      return eButton;
    }
  }

  onColumnVisibleEvent(event: ColumnVisibleEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onColumnPinnedEvent(event: ColumnPinnedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  onDragStoppedEvent(event: DragStoppedEvent) {
    this.agGridUtil.guardarEstadoGrilla();
  }

  mounted() {
    eventBus.changeTitlePage('Flotas');
    this.showTabVehiculos = config.chequeaPermisosTabs(
      Funcionalidades.Vehiculos,
      config.getClienteSesion()
    );

    this.axiosVehiculos.http
      .get(`vehiculo/${0}/${this.clienteId}/vehiculoEsCompartidoGrillaAnidada`)
      .then(res => {
        this.vehiculosCompartidos = res.data;
      });
  }

  created() {
    this.initialize();
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    return true;
  }

  onFilterTextBoxChanged() {
    clearInterval(this.intervalo);
    const self = this;
    this.intervalo = setInterval(function() {
      if (self.search.length >= 2) {
        self.gridApi.onFilterChanged();
      } else if (self.search.length === 0) {
        self.gridApi.setServerSideDatasource(self.serverSide);
      }
      clearInterval(self.intervalo);
    }, 500);
  }

  onGridReady(params: GridReadyEvent) {
    this.loadingService.showLoading();
    const self = this;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.agGridUtil = new AgGridUtil(
      this.gridApi,
      this.columnApi,
      this.estadoGrillaVm
    );

    this.agGridUtil.recuperarEstadoGrilla().finally(() => {
      this.serverSide = {
        getRows(params: any): void {
          params.request.search = self.search;
          params.request.paginationSize = self.gridOptions.cacheBlockSize; //Solución Paginación
          self.paramsExportar = params; //Parametros al Exportar

          //Ordenamiento + Seleccion
          const idFilasSeleccionadas = self.gridApi
            .getSelectedRows()
            .map(x => x.id);
          //---

          self.axiosVehiculos
            .http(
              `${self.controller}/${self.usuarioId}/${self.clienteId}/grid`,
              {
                params: params.request,
              }
            )
            .then(flotas => {
              if (flotas.data.data.length === 0) {
                self.gridApi.showNoRowsOverlay();
                params.successCallback([{}], 0);
              } else {
                params.successCallback(flotas.data.data, flotas.data.lastRow);
                //Ordenamiento + Seleccion
                self.gridApi.forEachNode(node => {
                  node.setSelected(false);
                });

                self.gridApi.forEachNode(node => {
                  let existe = idFilasSeleccionadas.find(
                    (x: any) => x === node.data.id
                  );
                  if (existe !== null && existe !== undefined) {
                    node.setSelected(true);
                  }
                });
                //---
                self.gridApi.hideOverlay();
              }
              self.loadingService.hideLoading();
            })
            .catch(err => {
              if (!err.response) {
                if (err.reponse.status !== 401) {
                  self.$snotify.error('Ocurrió un error en la búsqueda.');
                }
              }
              params.failCallback();
              self.loadingService.hideLoading();
            });
        },
      };
      this.gridApi.setServerSideDatasource(this.serverSide);
    });
  }

  onSelectionChanged(params: any) {
    this.muestraBarraBotones = this.gridApi.getSelectedNodes().length > 0;
    this.valCheck = this.gridApi.getSelectedRows(); //Ordenamiento + Seleccion

    if (this.gridApi.getSelectedNodes().length === 1) {
      this.tituloFlotaMensaje = this.$t('mensajes.crud.eliminarMasivo.titulo', {
        entidad: 'Flota',
      });
      this.eliminarFlotaMensaje = this.$t(
        'mensajes.crud.eliminarMasivo.mensaje',
        { los_cantidad_entidad_seleccionados: 'la Flota seleccionada' }
      );
    } else if (this.gridApi.getSelectedNodes().length > 1) {
      this.tituloFlotaMensaje = this.$t('mensajes.crud.eliminarMasivo.titulo', {
        entidad: 'Flotas',
      });
      this.eliminarFlotaMensaje = this.$t(
        'mensajes.crud.eliminarMasivo.mensaje',
        {
          los_cantidad_entidad_seleccionados:
            'las ' +
            this.gridApi.getSelectedNodes().length +
            ' Flotas seleccionadas',
        }
      );
    } else {
      this.tituloFlotaMensaje = '';
      this.eliminarFlotaMensaje = '';
    }
  }

  async deleteItemCallback(val: boolean) {
    this.dialogEliminar = false;
    if (val) {
      //Eliminación  masiva
      if (this.deleteMasivo) {
        if (this.gridApi.getSelectedNodes().length > 0) {
          let index = 0;
          let vehicleFloat: any = [];
          const items = this.gridApi.getSelectedNodes();
          this.loadingService.showLoading();

          try {
            for (let i = 0; i <= items.length - 1; i++) {
              await this.axiosVehiculos.http.delete(
                'flota?id=' + items[i].data.id
              );
              vehicleFloat.push({
                Id: items[i].data.id,
                FlotaId: this.editedIndex,
              });
              index = index + 1;

              if (index === items.length) {
                await this.enviaCorreoVehiculoCompartido(vehicleFloat);

                this.muestraBarraBotones = false;
                let msj: any = this.$t(
                  'mensajes.mensajesExito.eliminarMasivo',
                  {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'Las ' + items.length + ' Flotas seleccionadas'
                        : 'La Flota seleccionada',
                    eliminadaOs: items.length > 1 ? 'eliminadas' : 'eliminada',
                  }
                );
                if (items.length === 1) {
                  msj = msj.toString().replace('han', 'ha');
                }
                this.$snotify.success(msj);
                this.gridApi.deselectAll();
                this.gridApi.setServerSideDatasource(this.serverSide);
              }
            }
          } catch (e) {
            if (e.response !== undefined) {
              if (e.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'las ' + items.length + ' Flotas'
                        : 'la Flota',
                    eliminadaOs: 'seleccionadas',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'las ' + items.length + ' Flotas'
                      : 'la Flota',
                  eliminadaOs: 'seleccionadas',
                })
              );
            }
          } finally {
            this.loadingService.hideLoading();
          }
        }
      } else {
        await this.eliminarFlota();
      }
    }
    this.deleteMasivo = false;
  }

  async eliminarFlota() {
    this.dialogConfirmacionDespuesDeDesasociar = false;
    this.loadingService.showLoading();

    try {
      //Elimina Vehiculos y SubFlotas Asociados
      if (await this.eliminarAsociacionesFlotas()) {
        let vehicleFloat: any = [];
        this.vehiculosAsignados.forEach((veh: any) => {
          vehicleFloat.push({ Id: veh.id, FlotaId: this.editedIndex });
        });

        await this.axiosVehiculos.http.delete('Flota?id=' + this.editedIndex);
        if (this.notificaEsCompartido) {
          await this.dejarDeCompartir(this.editedIndex, this.idCompartida); //Cambio de formato de Correo
        }
        ////await this.enviaCorreoVehiculoCompartido(vehicleFloat); //Correo Antiguo

        this.loadingService.hideLoading();
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.eliminar', {
            entidad: 'La Flota',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'nombre'
            ),
            eliminadaO: 'eliminada',
          })
        );
        this.gridApi.deselectAll();
        this.gridApi.setServerSideDatasource(this.serverSide);
      }
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error(
            this.$t('mensajes.mensajesError.eliminar', {
              entidad: 'la Flota',
              nombre: config.getValorCelda(
                this.gridApi,
                this.editedIndex,
                'nombre'
              ),
            })
          );
        }
      } else {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.eliminar', {
            entidad: 'la Flota',
            nombre: config.getValorCelda(
              this.gridApi,
              this.editedIndex,
              'nombre'
            ),
          })
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  //NUEVA FUNCION - Cambio de Flujo
  async eliminarAsociacionesFlotas() {
    try {
      //Deja de Compartir Informacion
      const resCompInf = await this.axiosVehiculos.http.get(
        'compartirinformacion'
      );
      if (resCompInf.data.length > 0) {
        let dejarCompartir: any = [];
        dejarCompartir = resCompInf.data.filter(
          (x: any) =>
            x.funcionalidad === TipoCompartir.Flota &&
            x.fechaFinAsociacion === null &&
            x.identificadorId === this.editedIndex
        );

        dejarCompartir.forEach((item: any) => {
          let model: any = {
            Id: item.id,
            Descripcion: 'Borrado de Flota',
            Estado: EstadoEntidad.Inactivo,
            FechaFinAsociacion: new Date(),
            EstadoCompartirInformacion:
              EstadoCompartirInformacion.DejarDeCompartir,
          };
          this.axiosVehiculos.http.put('compartirinformacion', model);
        });
      }
      //---

      //recupera  y elimina vehiculos asignados a la flota
      const res = await this.axiosVehiculos.http.get(
        `${this.controller}/${this.editedIndex}/vehiculo/`
      );
      if (res.data.length > 0) {
        res.data.forEach((item: any) => {
          this.axiosVehiculos.http.delete(
            'flota/' +
              this.editedIndex +
              '/' +
              this.clienteId +
              '/vehiculo/' +
              item.id
          );
        });
      }
      //---

      //recupera y elimina subflotas asignadas a la flota
      const resSub = await this.axiosVehiculos.http.get(
        'flota/' + this.editedIndex + '/subflota'
      );
      if (resSub.data.length > 0) {
        resSub.data.forEach((item: any) => {
          let subflotasliminar: any = [];
          subflotasliminar.push({
            Id: item.id,
            ClienteId: item.clienteId,
            ResponsableFlotaId: 0,
            ResponsableMantenimientoFlotaId: 0,
            Nombre: item.nombre,
            Descripcion: item.descripcion,
            Estado: EstadoEntidad.Activo,
          });
          this.axiosVehiculos.http.delete(
            `${this.controller}/${item.id}/subflota/`,
            {
              data: subflotasliminar,
            }
          );
        });
      }
      //---

      return true;
    } catch (e) {
      if (e.response !== undefined) {
        if (e.response.status !== 401) {
          this.$snotify.error('Ocurrió un error al eliminar asociaciones.');
        }
      } else {
        this.$snotify.error('Ocurrió un error al eliminar asociaciones.');
      }
      return false;
    }
  }

  async enviaCorreoVehiculoCompartido(vehiculosFlotas: any) {
    try {
      const model: any = {
        Funcionalidad: Funcionalidades.AceptarInformacion,
        VehiculosFlotas: vehiculosFlotas,
        ClienteId: this.clienteId,
      };

      await this.axiosVehiculos.http.post(
        `${this.controller}/correoVehiculosCompartidos`,
        model
      );
    } catch (e) {
      vehiculosFlotas = [];
    }
  }

  //Se debe enviar el correo de "Dejar de Compartir"
  async dejarDeCompartir(flotaId: number, idCompartida: number) {
    //URL LOGIN
    let url: string = '';
    let arr = [];
    arr = window.location.pathname.split('/');

    if (arr.length >= 3) {
      url = window.location.origin + '/' + arr[1];
    } else {
      url = window.location.origin;
    }
    //---

    let modelEmail: any = {
      encodeIdUsuario: '',
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: url,
      url: '',
      idEntidad: 0,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: 0,
      compartirInformacionId: idCompartida,
    };
    const resCorreo: any = await this.axiosAuth.http.post(
      `Email/DejarDeCompartir`,
      modelEmail
    );
  }
  //---

  //solo flotas aceptadas
  esFlotaCompartida(flotaId: number) {
    this.axiosVehiculos.http
      .get('flota/' + flotaId + '/' + this.clienteId + '/flotaEsCompartido')
      .then(res => {
        //723 - Compartir Información - Editar Flota
        let numFlotaAceptada = res.data.length;
        if (res.data.length > 0) {
          numFlotaAceptada = res.data.filter(
            (x: any) => x.estadoCompInfo === EstadoCompartirInformacion.Aceptada
          ).length;
        }
        //---

        if (numFlotaAceptada > 0) {
          this.notificaEsCompartido = true;
          this.idCompartida = res.data[0].idCompartida;
        }
      })
      .catch(error => {});
  }

  closeModal(val: Boolean) {
    this.dialogEliminar = val;
    this.showModalNew = false;
    this.showModalEdit = false;
  }

  flotaModalCallback(val: boolean) {
    this.muestraBarraBotones = false;
    this.showModalNew = val;
    this.showModalEdit = val;
    this.showModalCambioEstado = val;
    this.dialogDesasociarVehiculos = val;

    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 10);
  }

  flotaDesasociarCallback(val: boolean) {
    if (val) {
      //muestra modal de confirmacion
      this.dialogDesasociarVehiculos = false;
      this.dialogConfirmacionDespuesDeDesasociar = true;
    } else {
      this.flotaModalCallback(false);
    }
    setTimeout(() => {
      this.gridApi.deselectAll();
      this.gridApi.setServerSideDatasource(this.serverSide);
    }, 10);
  }

  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    if (totalFilas > 0) {
      this.paramsExportar.request.startRow = 0;
      this.paramsExportar.request.endRow = totalFilas;
      this.paramsExportar.request.paginationSize = totalFilas;

      this.axiosVehiculos
        .http(`${this.controller}/${this.usuarioId}/${this.clienteId}/grid`, {
          params: this.paramsExportar.request,
        })
        .then(respServer => {
          config.crearArchivoCsv(
            'Flotas.csv',
            respServer.data.data,
            this.columnDefs
          );
          this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
        })
        .catch(err => {
          if (!err.response) {
            this.$snotify.error('Ocurrió un error al exportar.');
          }
        });
    } else {
      this.$snotify.warning('No existen datos para exportar.');
    }
  }

  eliminarSeleccionadas() {
    let model: any = [];
    this.vehiculosAsociadosFlotas = [];
    this.cantidadVehiculosEliminaMasivo = 0;
    this.subflotasAsociadosFlotas = [];
    this.cantidadSubflotasEliminaMasivo = 0;
    var items = this.gridApi.getSelectedNodes();
    this.esEliminar = true;
    this.flotasPorDefecto = [];
    this.existeFlotaDestino = false;

    //Si hay un solo registro debe ejecutar el mismo "Eliminar" de "acciones"
    if (items.length === 1) {
      this.eliminaItemValidacion(items[0].data.id);
    } else {
      //Si hay mas de un registro seleccionado debe hacer la eliminacion masiva habitual
      items.forEach((flota: any) => {
        //Valida que no sea Flota por defecto
        if (flota.data.estado == EstadoEntidad.Sistema) {
          this.esEliminar = false;
          this.flotasPorDefecto.push(flota.data.nombre);
        }
        //---

        //Valida que no sea Flota Recibe
        if (flota.data.esFlotaRecibe === true) {
          this.existeFlotaDestino = true;
        }
        //---

        model.push({
          Id: flota.data.id,
          PadreId: 0,
          ClienteId: 0,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: '',
          Descripcion: '',
          Estado: EstadoEntidad.Activo,
        });
      });

      if (!this.esEliminar) {
        this.tituloFlotaPorDefecto = 'Eliminar Flotas';
        this.mensajeFlotaPorDefecto =
          'Una de las Flotas que desea eliminar es una Flota por defecto, por esta razón no se podrá realizar la eliminación.';
        this.dialogFlotaPorDefecto = true;
      } else {
        this.axiosVehiculos.http
          .post(`${this.controller}/vehiculo/`, model)
          .then(res => {
            this.axiosVehiculos.http
              .post(`${this.controller}/subflotas/`, model)
              .then(res2 => {
                if (res.data.length > 0 || res2.data.length > 0) {
                  this.vehiculosAsociadosFlotas = res.data;
                  this.cantidadVehiculosEliminaMasivo = res.data.length;

                  this.subflotasAsociadosFlotas = res2.data;
                  this.cantidadSubflotasEliminaMasivo = res2.data.length;

                  if (this.existeFlotaDestino) {
                    this.tituloAsociadasEliminar =
                      'Las Flotas que desea eliminar se encuentran asociadas o son Flotas de recepción de Vehículos compartidos. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
                  } else {
                    this.tituloAsociadasEliminar =
                      'Las Flotas tienen asociaciones, por esta razón no se podrá realizar la eliminación.';
                  }

                  this.dialogEliminacionMasivaValida = true;
                  this.tituloModalEliminar = 'Eliminar Flotas';
                } else {
                  if (this.existeFlotaDestino) {
                    this.tituloFlotaPorDefecto = 'Eliminar Flotas';
                    this.mensajeFlotaPorDefecto =
                      'Una de las Flotas que desea eliminar son Flotas de recepción de Vehículos compartidos. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
                    this.dialogFlotaPorDefecto = true;
                  } else {
                    this.deleteMasivo = true;
                    this.dialogEliminar = true;
                  }
                }
              })
              .catch(err => {
                if (err.response !== undefined) {
                  if (err.response.status !== 401) {
                    this.$snotify.error(
                      this.$t('mensajes.mensajesError.eliminarMasivo', {
                        los_cantidad_entidad_seleccionados:
                          items.length > 1
                            ? 'las ' + items.length + ' Flotas'
                            : 'la Flota',
                        eliminadaOs: 'seleccionadas',
                      })
                    );
                  }
                } else {
                  this.$snotify.error(
                    this.$t('mensajes.mensajesError.eliminarMasivo', {
                      los_cantidad_entidad_seleccionados:
                        items.length > 1
                          ? 'las ' + items.length + ' Flotas'
                          : 'la Flota',
                      eliminadaOs: 'seleccionadas',
                    })
                  );
                }
              });
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'las ' + items.length + ' Flotas'
                        : 'la Flota',
                    eliminadaOs: 'seleccionadas',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'las ' + items.length + ' Flotas'
                      : 'la Flota',
                  eliminadaOs: 'seleccionadas',
                })
              );
            }
          });
      }
    }
  }

  eliminarFlotasConDesasociacion() {
    if (this.vehiculosAsociadosFlotas.length > 0) {
      let index: number = 0;
      //Desasocia vehiculos de las flota seleccionadas
      this.vehiculosAsociadosFlotas.forEach((item: any) => {
        this.axiosVehiculos.http
          .delete(
            'flota/' +
              item.flotaId +
              '/' +
              this.clienteId +
              '/vehiculo/' +
              item.vehiculoId
          )
          .then(res => {
            index += 1;
            if (index == this.vehiculosAsociadosFlotas.length) {
              this.desasociarSubFlotas();
            }
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      'las ' + this.vehiculosAsociadosFlotas.length + ' Flotas',
                    eliminadaOs: 'seleccionadas',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    'las ' + this.vehiculosAsociadosFlotas.length + ' Flotas',
                  eliminadaOs: 'seleccionadas',
                })
              );
            }
          });
      });
    } else {
      this.desasociarSubFlotas();
    }
  }

  desasociarSubFlotas() {
    if (this.subflotasAsociadosFlotas.length > 0) {
      let index: number = 0;
      //Desasocia vehiculos de las flota seleccionadas
      this.subflotasAsociadosFlotas.forEach((item: any) => {
        let subflotasliminar: any = [];
        subflotasliminar.push({
          Id: item.id,
          ClienteId: item.clienteId,
          ResponsableFlotaId: 0,
          ResponsableMantenimientoFlotaId: 0,
          Nombre: item.nombre,
          Descripcion: item.descripcion,
          Estado: EstadoEntidad.Activo,
        });

        this.axiosVehiculos.http
          .delete(`${this.controller}/${item.id}/subflota/`, {
            data: subflotasliminar,
          })
          .then(res => {
            index += 1;
            if (index == this.subflotasAsociadosFlotas.length) {
              var items = this.gridApi.getSelectedNodes();
              index = 0;

              //Elimina flota seleccionadas
              for (let i = 0; i <= items.length - 1; i++) {
                this.axiosVehiculos.http
                  .delete('Flota?id=' + items[i].data.id)
                  .then(res => {
                    index = index + 1;
                    if (index == items.length) {
                      this.muestraBarraBotones = false;
                      this.dialogEliminacionMasivaValida = false;
                      this.cantidadVehiculosEliminaMasivo = 0;
                      this.$snotify.success(
                        this.$t('mensajes.mensajesExito.eliminarMasivo', {
                          los_cantidad_entidad_seleccionados:
                            items.length > 1
                              ? 'las ' + items.length + ' Flotas seleccionadad'
                              : 'la Flota seleccionada',
                          eliminadaOs: 'eliminadas',
                        })
                      );
                      this.gridApi.deselectAll();
                      this.gridApi.setServerSideDatasource(this.serverSide);
                    }
                  })
                  .catch(err => {
                    if (err.response !== undefined) {
                      if (err.response.status !== 401) {
                        this.$snotify.error(
                          this.$t('mensajes.mensajesError.eliminarMasivo', {
                            los_cantidad_entidad_seleccionados:
                              items.length > 1
                                ? 'las ' + items.length + ' Flotas'
                                : 'la Flota',
                            eliminadaOs: 'seleccionadas',
                          })
                        );
                      }
                    } else {
                      this.$snotify.error(
                        this.$t('mensajes.mensajesError.eliminarMasivo', {
                          los_cantidad_entidad_seleccionados:
                            items.length > 1
                              ? 'las ' + items.length + ' Flotas'
                              : 'la Flota',
                          eliminadaOs: 'seleccionadas',
                        })
                      );
                    }
                  });
              }
            }
          })
          .catch(err => {
            //this.$snotify.error('Ocurrió un error al actualizar la asociación de Subflotas.');
          });
      });
    } else {
      var items = this.gridApi.getSelectedNodes();
      let index = 0;

      //Elimina flotas seleccionadas
      for (let i = 0; i <= items.length - 1; i++) {
        this.axiosVehiculos.http
          .delete('Flota?id=' + items[i].data.id)
          .then(res => {
            index = index + 1;
            if (index == items.length) {
              this.muestraBarraBotones = false;
              this.dialogEliminacionMasivaValida = false;
              this.cantidadVehiculosEliminaMasivo = 0;
              this.$snotify.success(
                this.$t('mensajes.mensajesExito.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'las ' + items.length + ' Flotas seleccionadas'
                      : 'la Flota seleccionada',
                  eliminadaOs: 'eliminadas',
                })
              );
              this.gridApi.deselectAll();
              this.gridApi.setServerSideDatasource(this.serverSide);
            }
          })
          .catch(err => {
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.$snotify.error(
                  this.$t('mensajes.mensajesError.eliminarMasivo', {
                    los_cantidad_entidad_seleccionados:
                      items.length > 1
                        ? 'las ' + items.length + ' Flotas'
                        : 'la Flota',
                    eliminadaOs: 'seleccionadas',
                  })
                );
              }
            } else {
              this.$snotify.error(
                this.$t('mensajes.mensajesError.eliminarMasivo', {
                  los_cantidad_entidad_seleccionados:
                    items.length > 1
                      ? 'las ' + items.length + ' Flotas'
                      : 'la Flota',
                  eliminadaOs: 'seleccionadas',
                })
              );
            }
          });
      }
    }
  }

  eliminaItemValidacion(flotaId: number) {
    let item: any = null;
    var rows = this.gridApi.getRenderedNodes();
    for (let i = 0; i < rows.length; i++) {
      var rowNode = rows[i];
      if (rowNode.data.id !== undefined && rowNode.data.id !== null) {
        if (flotaId == rowNode.data.id) {
          item = rowNode.data;
          break;
        }
      }
    }

    if (item != null) {
      this.nombreFlotaEliminar = item.nombre;
    }

    //Valida que no sea Flota por defecto
    this.esEliminar = true;
    if (item.estado == EstadoEntidad.Sistema) {
      this.tituloFlotaPorDefecto = 'Eliminar Flota: ' + item.nombre;
      this.mensajeFlotaPorDefecto =
        'La Flota que desea eliminar es una Flota por defecto, por esta razón no se podrá realizar la eliminación.';
      this.flotasPorDefecto = [];
      this.esEliminar = false;
      this.dialogFlotaPorDefecto = true;
    } else if (item.esFlotaRecibe === true) {
      //Valida que la Flota no sea quien recibe vehiculos
      this.tituloFlotaPorDefecto = 'Eliminar Flota: ' + item.nombre;
      this.mensajeFlotaPorDefecto =
        'La Flota que desea eliminar es una Flota de recepción de Vehículos compartidos. Dado a esto, no se puede llevar a cabo la eliminación solicitada.';
      this.flotasPorDefecto = [];
      this.esEliminar = false;
      this.dialogFlotaPorDefecto = true;
    } else {
      //---
      this.axiosVehiculos.http
        .get(`${this.controller}/${flotaId}/vehiculo/`)
        .then(res => {
          this.cantidadVehiculosAsociados = res.data.length;
          this.deleteMasivo = false;
          this.editedIndex = flotaId;

          this.tituloFlotaMensaje = this.$t('mensajes.crud.eliminar.titulo', {
            entidad: 'Flota',
            nombreEntidad: config.getValorCelda(
              this.gridApi,
              flotaId,
              'nombre'
            ),
          });

          this.eliminarFlotaMensaje = this.$t(
            'mensajes.crud.eliminar.mensaje',
            { entidad: 'la Flota' }
          );

          if (this.esEliminar) {
            //recupera subflotas asignadas a la flota
            this.axiosVehiculos.http
              .get(`${this.controller}/${flotaId}/subflota`)
              .then(res => {
                this.cantidadSubFlotasAsociadas = res.data.length;

                if (
                  this.cantidadVehiculosAsociados > 0 ||
                  this.cantidadSubFlotasAsociadas > 0
                ) {
                  this.editedItem = item;
                  this.dialogConfirmaEliminar = true;
                } else {
                  this.dialogEliminar = true;
                }
              })
              .catch(error => {
                if (this.cantidadVehiculosAsociados > 0) {
                  this.editedItem = item;
                  this.dialogConfirmaEliminar = true;
                } else {
                  this.dialogEliminar = true;
                }
              });
          }
        });
    }
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        id: {
          required: () => config.errorMensajes.textoRequerido,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    actionsEvent.$on('actionsEvent', (data: any) => {
      if (data.action == Accion.Eliminar) {
        this.notificaEsCompartido = false;
        this.idCompartida = 0;
        this.esFlotaCompartida(data.id);
        this.eliminaItemValidacion(data.id);
        /*this.axiosVehiculos.http
          .get(`${this.controller}/${data.id}/vehiculo/`)
          .then(res => {
            this.cantidadVehiculosAsociados = res.data.length;
            this.deleteMasivo = false;
            this.editedIndex = data.id;

            this.tituloFlotaMensaje = this.$t("mensajes.crud.eliminar.titulo", {
              entidad: "Flota",
              nombreEntidad: config.getValorCelda(
                this.gridApi,
                data.id,
                "nombre"
              )
            });

            this.eliminarFlotaMensaje = this.$t(
              "mensajes.crud.eliminar.mensaje",
              { entidad: "la Flota" }
            );

            let item: any = null;
            var rows = this.gridApi.getRenderedNodes();
            for (let i = 0; i < rows.length; i++) {
              var rowNode = rows[i];
              if (rowNode.data.id !== undefined && rowNode.data.id !== null) {
                if (data.id == rowNode.data.id) {
                  item = rowNode.data;
                  break;
                }
              }
            }

            if (item != null) {
              this.nombreFlotaEliminar = item.nombre;
            }


            //Valida que no sea Flota por defecto
            this.esEliminar = true;
            if (item.estado == EstadoEntidad.Sistema)
            {
              this.tituloFlotaPorDefecto = "Eliminar Flota: " + item.nombre;
              this.mensajeFlotaPorDefecto = "La Flota que desea eliminar es una Flota por defecto. Dado a esto, no se puede llevar a cabo la eliminación solicitada.";
              this.flotasPorDefecto = [];
              this.esEliminar = false;
              this.dialogFlotaPorDefecto = true;
            }
            //---


            if (this.esEliminar) {
              //recupera subflotas asignadas a la flota
              this.axiosVehiculos.http
                .get(`${this.controller}/${data.id}/subflota`)
                .then(res => {
                  this.cantidadSubFlotasAsociadas = res.data.length;

                  if (
                    this.cantidadVehiculosAsociados > 0 ||
                    this.cantidadSubFlotasAsociadas > 0
                  ) {
                    this.editedItem = item;
                    this.dialogConfirmaEliminar = true;
                  } else {
                    this.dialogEliminar = true;
                  }
                })
                .catch(error => {
                  if (this.cantidadVehiculosAsociados > 0) {
                    this.editedItem = item;
                    this.dialogConfirmaEliminar = true;
                  } else {
                    this.dialogEliminar = true;
                  }
                });
            }
          });*/
      } else if (
        data.action == Accion.Editar ||
        data.action == Accion.VerDetalle
      ) {
        //Editar
        this.modalEsEdicion = data.action == Accion.Editar;

        this.editedIndex = data.id;
        let item: any = null;
        var rows = this.gridApi.getRenderedNodes();
        for (let i = 0; i < rows.length; i++) {
          var rowNode = rows[i];
          if (rowNode.data.id !== undefined && rowNode.data.id !== null) {
            if (data.id == rowNode.data.id) {
              item = rowNode.data;
              break;
            }
          }
        }

        if (item != null) {
          //Valida que no sea Flota por defecto
          if (
            item.estado == EstadoEntidad.Sistema &&
            data.action == Accion.Editar
          ) {
            this.tituloFlotaPorDefecto = 'Editar Flota: ' + item.nombre;
            this.mensajeFlotaPorDefecto =
              'La Flota que desea editar es una Flota por defecto. Dado a esto, no se puede llevar a cabo la acción solicitada.';
            this.flotasPorDefecto = [];
            this.dialogFlotaPorDefecto = true;
          } else {
            this.editedItem = item;
            this.showModalEdit = true;
          }
          //---
        }
      }
    });
  }

  beforeDestroy() {
    this.agGridUtil.guardarEstadoGrilla().finally(() => {
      this.gridApi.destroy();
    });
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>
