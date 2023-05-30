<template>
  <v-layout row justify>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
        <v-toolbar dark color="primary" fixed>
          <v-btn icon dark @click="cerrarOperacion()" :disabled="btnBloquear">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>{{ 'Ver Detalle Importar' }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <!-- <v-toolbar-items>
            <v-btn
              class="btn-volver"
              v-if="esEdicion"
              @click="
                e1 -= 1;
                btnText = 'Continuar';
                btnClass = 'btn-continuar';
              "
              :disabled="e1 <= 1 || btnBloquear"
              v-show="e1 != 1"
            >Volver</v-btn>&nbsp;&nbsp;
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear ? true : false"
              @click="grabarEdicion()"
            >Guardar Cambios</v-btn>
          </v-toolbar-items>-->
        </v-toolbar>
        <br />
        <br />
        <br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
                @click="cierraMenu()"
                color="primary"
                flat
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>

              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (detalleCarga.visible && esEdicion) ||
                    (detalleCarga.visible && !esEdicion)
                "
                :value="detalleCarga.step"
              >
                <span>Detalle Carga</span>
                <v-icon>credit_card</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>

          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-form
                  ref="form"
                  v-model="validForm"
                  lazy-validation
                  class="col-md-12"
                >
                  <v-container grid-list-md>
                    <div align="left">
                      <h2
                        class="h2_title"
                        style="margin-top: 12px!important; font-weight: normal"
                      >
                        Información General
                      </h2>
                      <v-divider></v-divider>
                    </div>
                    <br />
                    <v-layout wrap>
                      <v-flex md6>
                        <v-text-field
                          v-model="editedItem.modulo"
                          label="Tipo Carga"
                          icon="fas fa-angle-down"
                          v-validate="'required'"
                          :error-messages="errors.collect('tipoCarga')"
                          data-vv-name="tipoCarga"
                          no-data-text="Sin resultados"
                          disabled
                        ></v-text-field>
                      </v-flex>
                      <v-flex md1 style="padding-top:24px; padding-right:20px;">
                        <v-btn text icon color="white">
                          <v-icon
                            title="Descargar Formato"
                            @click="descargaFormato()"
                            >assignment_returned</v-icon
                          >
                        </v-btn>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Descripción"
                          :counter="200"
                          v-validate="'max:200|required'"
                          data-vv-name="descripcion"
                          v-model="editedItem.descripcion"
                          type="text"
                          :error-messages="errors.collect('descripcion')"
                          disabled
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Seleccionar Archivo"
                          heigh
                          @click="$refs.image.click()"
                          prepend-icon="attach_file"
                          v-model="editedItem.archivoRef"
                          readonly="readonly"
                          disabled
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <div
            class="cardnew"
            align="center"
            v-show="
              bottomNav == detalleCarga.step &&
                ((detalleCarga.visible && esEdicion) ||
                  (detalleCarga.visible && !esEdicion))
            "
          >
            <br />
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <div align="left">
                      <v-flex md12>
                        <h2 class="h2_title">Detalle Carga</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap>
                    <v-flex md3>
                      <v-text-field
                        v-model="editedItem.fechaCreacionTxt"
                        label="Fecha Carga"
                        persistent-hint
                        prepend-inner-icon="event"
                        readonly
                        required
                        :disabled="true"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <v-text-field
                        v-model="editedItem.estadoImportarTxt"
                        label="Estado"
                        :disabled="true"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout>
                    <v-flex xs3 sm3 md3>
                      <v-text-field
                        label="Total Registros"
                        disabled
                        required
                        v-model="editedItem.registrosNum"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs3 sm3 md3>
                      <v-text-field
                        label="Total OK"
                        disabled
                        required
                        v-model="editedItem.registrosOk"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs3 sm3 md3>
                      <v-text-field
                        label="Total Error"
                        disabled
                        required
                        v-model="editedItem.registrosError"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex md6>
                      <v-text-field
                        v-model="buscar"
                        append-icon="search"
                        prepend-icon="lock_open"
                        label="Buscar..."
                        @input="onFilterTextBoxChanged"
                      ></v-text-field>
                    </v-flex>
                    <v-flex md6>
                      <div align="right" style="padding-top:15px;">
                        <v-btn
                          v-if="exportarVerDetalle.visible"
                          flat
                          small
                          color="primary"
                          style="padding-right: 20px;"
                          @click="exportar()"
                        >
                          <v-icon class="importExportBtnIcon"
                            >cloud_download</v-icon
                          >&nbsp;&nbsp;
                          <span class="importExportBtnTexto">Exportar</span>
                        </v-btn>
                      </div>
                    </v-flex>
                  </v-layout>
                  <div align="left">
                    <v-layout row wrap>
                      <v-flex md12>
                        <v-card>
                          <ag-grid-vue
                            style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                            class="ag-theme-material"
                            :columnDefs="columnDefs"
                            :rowData="detalleRespaldo"
                            rowSelection="single"
                            rowMultiSelectWithClick="false"
                            pagination="true"
                            paginationPageSize="10"
                            suppressRowClickSelection="true"
                            :sideBar="sideBar"
                            :localeText="localeText"
                            :onGridReady="onGridReady"
                            :postProcessPopup="onClickCell"
                            suppressCopyRowsToClipboard="true"
                            :suppressCsvExport="true"
                            :suppressExcelExport="true"
                            :key="dKey"
                            :processCellForClipboard="processCellForClipboard"
                          ></ag-grid-vue>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </div>
                </v-container>
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Importar',
          nombreEntidad: editedItem.nombre,
        })
      "
      :mensaje="
        $t('mensajes.crud.editar.mensaje', {
          entidad: 'Importar',
        })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
      :width="450"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import moment from 'moment';
import { IClientes } from '@/interfaces/Clientes';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { EstadoEntidad, ServicioProxy } from '@/config/enums';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  CsvExportParams,
  ValueFormatterParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';
import { IImportar } from '../../interfaces/Importar';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { log } from 'util';
import { setTimeout } from 'timers';
import { format } from 'url';
import { date } from 'yup';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ImportarModalVerDetalle extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({
      id: 0,
      descripcion: '',
      estado: EstadoEntidad.Activo,
    }),
  })
  importarVd!: IImportar;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Importar;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoAccionPadre: CodigoAccion.Editar,
    codigoSubAccion: 19,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  detalleCarga: PermisoAccionVm = {
    accion: 'Ver Detalle - Detalle Carga',
    visible: true,
    step: 2,
    codigoSubAccion: 46,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  exportarVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Exportar',
    visible: true,
    step: 2,
    codigoSubAccion: CodigoAccion.Exportar,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.informacionGeneralVerDetalle,
    this.detalleCarga,
    this.exportarVerDetalle,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IImportar = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  muestraClientes: boolean = false;
  buscarCliente: string = '';
  tiposCarga: any[] = [];
  tipoCarga: number = 0;
  fileName: string = '';
  csvUrl: any = null;
  csvFile: any = null;
  descripcion: any = '';
  idkey: number = 0;
  totalRegistros: number = 0;
  detalleRespaldo: any = [];
  detallemounted: any = [];
  handleErrors: HandleErrors = new HandleErrors();
  buscar: string = '';
  diccionario: any = [];
  controllerCarga: string = 'cargaArchivo';
  dataExportar: string = '';
  zipExportar: string = '';
  dKey: number = 0;

  //ASOCIACIONES///////////////////////////////////////////////////////////////////////////////////////////////
  //FIN ASOCIACIONES//////////////////////////////////////////////////////////////////////////////////////////

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;
  contadorEventoGrilla: number = 0;
  contadorEventoGrillaSelection: number = 0;
  columnDefs: Array<ColDef> = [];

  btnBloquear: Boolean = false;
  controller: string = 'importacion';
  estadoSeleccionado: any = null;
  estadosServices: EstadosService = new EstadosService();
  estados: EstadoInterface[] = this.estadosServices.getEstadosVisibles();

  paramsExportar: any; //Parametros para Exportar

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axios: AxiosVue = new AxiosVue(ServicioProxy.Importacion);
  clienteId: number = config.getClienteSesion();

  //---------------------------------------------------------------------------------------------------------
  //lOAD ---------------------------------------------------------------------------
  cerrarOperacion() {
    if (this.esEdicion) {
      this.dialogConfirmacionClose = true;
    } else {
      this.closeModal(false);
    }
  }

  async initialize() {
    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: this.esEdicion,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
        cellStyle: params =>
          !this.esEdicion
            ? {
                textAlign: 'left',
                'pointer-events': 'none',
              }
            : { textAlign: 'left' },
      },
      {
        headerName: 'Código',
        field: 'id',
        sortable: true,
        resizable: true,
        lockPinned: true,
        width: 150,
        minWidth: 80,
        hide: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
    await this.setDinamycalsRows();
  }

  mounted() {}

  private registrarValidadores() {
    const self = this;
    const clienteId = config.getClienteSesion();
  }
  created() {
    this.initialize();
    this.registrarValidadores();
  }

  onFilePicked(e: any) {
    var formData = new FormData();

    const files = e.target.files;
    if (files[0] !== undefined) {
      this.fileName = files[0].name;

      if (this.fileName.lastIndexOf('.') <= 0) {
        return;
      }

      let fr = new FileReader();
      fr.readAsDataURL(files[0]);
      fr.addEventListener('load', () => {
        this.csvUrl = fr.result;
        this.csvFile = files[0];
      });
      formData.append('ConductorFile', files[0]);
    }
  }

  //EVENTOS -----------------------------------------------------------------------
  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar Cambios';
    this.bottomNav = '1';
    this.btnBloquear = false;

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        let importId = this.importarVd.id;
        const self = this;
        const impor = await this.axios.http.get(
          `${self.controller}/${self.clienteId}/${importId}`
        );
        impor.data.estadoImportarTxt = impor.data.estadoImportarTxt.replace(
          /([a-z])([A-Z])/g,
          '$1 $2'
        );
        this.editedItem = impor.data;
      } catch (error) {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.handleErrors.showError(error);
          }
        } else {
          this.handleErrors.showError(error);
        }
      } finally {
        this.loadingService.hideLoading();
      }
      await this.initialize();
    }
    // this.clientesRespaldo.forEach(cliente => {
    //   let exists: any = this.clientesAsignados.filter(
    //     (x: any) => x.id === cliente.id
    //   );
    //   if (exists.length == 0) {
    //     cliente.checked = false;
    //   } else {
    //     cliente.checked = true;
    //   }
    // });
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
    this.permisosTotales.forEach(obj => {
      if (obj.visible && obj.accion.includes(accion) && !evaluado) {
        this.bottomNav = obj.step;
        evaluado = true;
      }
    });
  }

  //MODAL -------------------------------------------------------------------
  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.dKey += 1;
    this.buscarCliente = '';
    this.buscar = '';
    this.contadorEventoGrillaSelection = 0;
    this.contadorEventoGrilla = 0;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }
  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  confirmCallbackConfirm(aceptado: boolean) {
    this.dialogConfirmacionClose = false;

    if (aceptado) {
      this.closeModal(false);
    }
  }

  close() {
    this.loadingService.hideLoading();
    this.btnBloquear = false;
    this.closeModal(false);
    this.dialogConfirmacion = false;

    this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
  }

  //ASOCIACIONES /////////////////////////////////////////////////////////////////////////////////////////////

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  async generateColumns(data: any[]) {
    let columnDefinitions: any = [];

    data.map(object => {
      Object.keys(object).map(key => {
        var keyFake = key;
        const self = this;

        if (keyFake != 'estadoImportar') {
          if (keyFake == 'estadoImportarTxt') {
            let mappedColumn = {
              headerName: 'Estado',
              field: key,
            };
            this.columnDefs.push({
              headerName: mappedColumn.headerName,
              field: mappedColumn.field,
              sortable: true,
              resizable: true,
              minWidth: 90,
              width: 150,
              lockVisible: true,
              lockPinned: true,
              cellStyle: { textAlign: 'left' },
            });
          } else {
            let mappedColumn = {
              headerName: key,
              field: key,
            };
            this.diccionario.find((x: any) => {
              var existe = x.nombreDefecto == mappedColumn.headerName;
              if (existe) {
                mappedColumn.headerName = x.nombreCorrecto;
              }
            });
            this.columnDefs.push({
              headerName:
                mappedColumn.headerName.includes('SIM') ||
                mappedColumn.headerName.includes('Telecomunicaciones') ||
                mappedColumn.headerName.includes('IMEI') ||
                mappedColumn.headerName.includes('VIN') ||
                mappedColumn.headerName.includes('TAG')
                  ? mappedColumn.headerName
                  : self.UpperCaseArray(
                      (
                        mappedColumn.headerName.charAt(0).toUpperCase() +
                        mappedColumn.headerName.slice(1)
                      ).toString()
                    ),
              field: mappedColumn.field,
              valueFormatter: (e: ValueFormatterParams) =>
                e.value instanceof Date
                  ? moment(e.value as Date).format('DD/MM/YYYY')
                  : e.value,
              sortable: true,
              getQuickFilterText: (e: GetQuickFilterTextParams) =>
                e.value instanceof Date
                  ? moment(e.value as Date).format('DD/MM/YYYY')
                  : e.value,
              resizable: true,
              minWidth: 90,
              width: 220,
              lockPinned: true,
              cellStyle: { textAlign: 'left' },
            });
          }
        }
      });
    });

    //Remove duplicate columns
    this.columnDefs = this.columnDefs.filter(
      (column: any, index: number, self: any) =>
        index ===
        self.findIndex((colAtIndex: any) => colAtIndex.field === column.field)
    );
    return this.columnDefs;
  }
  async setDinamycalsRows() {
    if (this.importarVd.id != null || this.importarVd.id != undefined) {
      await this.obtenerDiccionarioCabeceras();
      await this.obtenerDetalle();
    }
  }
  UpperCaseArray(input: string) {
    return input.match(/[A-Z][a-z|ñáéíóúÁÉÍÓÚ|.\s]+/g).join(' ');
  }
  async obtenerDetalle() {
    try {
      const self = this;
      const response = await this.axios.http.get(
        `${self.controller}/${self.importarVd.id}/GetDetalleDocumento/grid`
      );
      this.detallemounted = response.data;

      response.data.forEach((x: any) => {
        if (x.hasOwnProperty('fechaNacimiento') && x.fechaNacimiento !== '') {
          x.fechaNacimiento = moment(x.fechaNacimiento, 'DD/MM/YYYY').toDate();
        }
        if (
          x.hasOwnProperty('vencimientoCedula') &&
          x.vencimientoCedula !== ''
        ) {
          x.vencimientoCedula = moment(
            x.vencimientoCedula,
            'DD/MM/YYYY'
          ).toDate();
        }
      });
      this.detalleRespaldo = response.data;

      await this.generateColumns(this.detalleRespaldo);
    } catch (error) {
      this.loadingService.hideLoading();
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.handleErrors.showError(error);
        }
      } else {
        this.handleErrors.showError(error);
      }
    }
  }
  getRowNodeId(imp: IImportar) {
    if (!imp) {
      return;
    }
    return imp.id;
  }
  processCellForClipboard({ value }: { value: string | number | Date }) {
    return value instanceof Date ? moment(value).format('DD/MM/YYYY') : value;
  }
  onFilterTextBoxChanged() {
    if (this.buscar.length > 1) {
      this.gridApi.setQuickFilter(this.buscar);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }
  exportar() {
    let totalFilas = this.gridApi.paginationGetRowCount();
    this.detallemounted.forEach((x: any) => {
      if (x.hasOwnProperty('fechaNacimiento') && x.fechaNacimiento !== '') {
        x.fechaNacimiento = moment(x.fechaNacimiento, 'DD/MM/YYYY').format(
          'DD/MM/YYYY'
        );
      }
      if (x.hasOwnProperty('vencimientoCedula') && x.vencimientoCedula !== '') {
        x.vencimientoCedula = moment(x.vencimientoCedula, 'DD/MM/YYYY').format(
          'DD/MM/YYYY'
        );
      }
    });
    if (totalFilas > 0) {
      config.crearArchivoCsv(
        'DetalleCarga' + this.editedItem.modulo.replace(' ', '') + '.csv',
        this.detallemounted,
        this.columnDefs
      );
      this.$snotify.success(this.$t('mensajes.mensajesExito.exportar'));
    } else {
      this.$snotify.warning('No existen datos para exportar.');
    }
  }
  obtenerDiccionarioCabeceras() {
    const self = this;
    this.axios.http.get(`${self.controller}/diccionario`).then(res => {
      this.diccionario = res.data;
    });
  }
  async descargaFormato() {
    try {
      const responseZip = await this.axios.http.get(
        `${this.controller}/${this.editedItem.importarModuloId}/${this.clienteId}/GetFormato`
      );
      this.zipExportar = responseZip.data.archivoBase64;
      if (this.zipExportar) {
        const archivoName = responseZip.data.nombre;
        var byteCharacters = atob(this.zipExportar);
        var byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);

        // construimos un blob con el array de byte
        var blob1 = new Blob([byteArray], {
          type: 'application/octet-stream',
        });
        this.exportarZip(blob1, archivoName);
      }
    } catch (ex) {
      this.handleErrors.showError(ex);
    }
  }
  exportarZip(blob: any, fileName: any) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement('a');
    //anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }
}
</script>

<style>
.h2_title {
  font-weight: normal;
}
</style>
