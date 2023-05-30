<template>
  <ModalMantenedor :show="show" style="overflow-y: hidden;">
    <CabeceraModal
      titulo="Editar Ruta"
      @cerrar="handleCerrar"
      v-show="!verDetalle"
    >
      <!-- <v-btn
        class="btn-grabar"
        color="#526da5"
        @click="confirm = true"
        v-show="!verDetalle"
      >
        <span style="color: white;">Guardar Cambios</span>
      </v-btn> -->
    </CabeceraModal>
    <CabeceraModal titulo="Ver Ruta" @cerrar="handleCerrar" v-show="verDetalle">
    </CabeceraModal>
    <v-dialog v-model="confirm" persistent :max-width="400">
      <v-card>
        <v-toolbar style="font-size:17px;" dark color="primary">
          Guardar Cambios
        </v-toolbar>
        <divider></divider>
        <v-card-text>
          <div style="width: 100%; ">
            <div>
              Al guardar los cambios, las tarifas que se encuentren señaladas en
              rojo serán eliminadas.
            </div>
            <br />
            <div>¿Desea continuar?</div>
          </div>
        </v-card-text>
        <divider></divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" small @click="confirm = false">
            <span style="color: #526da5;">Cancelar</span>
          </v-btn>
          <v-btn color="#526da5" small @click="sendData()">
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        absolute
        color="transparent"
        :active.sync="seleccionado"
      >
        <v-btn title="Categorias" v-show="true" color="primary" flat>
          <span>Categorías</span>
          <v-icon>directions_car</v-icon>
        </v-btn>
        <v-btn title="Rutas" v-show="true" color="primary" flat>
          <span>Rutas</span>
          <v-icon>route</v-icon>
        </v-btn>
      </v-bottom-nav>

      <v-btn
        v-b-tooltip.hoover
        title="Agregar"
        color="primary"
        class="ma-2"
        @click="showAdd()"
        fab
        large
        right
        absolute
        v-show="!verDetalle"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </v-card>
    <br />

    <div
      class="card"
      style="width: 85%;  overflow-y: auto;"
      v-show="seleccionado == 0"
    >
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div>

    <div
      class="card"
      style="width: 85%;  overflow-y: auto;"
      v-show="seleccionado == 1"
    >
      <MantenedorGridSinCodigo
        :grid-options="gridOptionsRuta"
        :funcionalidad-id="funcionalidad"
      />
    </div>

    <br />
    <v-dialog v-model="categoriaDialog" width="650px">
      <v-card class="card" style="width: 100%;">
        <v-text-field
          label="Categorías"
          v-model="categoriaSeleccionada"
          :disabled="catShow"
        ></v-text-field>
        <v-autocomplete
          label="Tipos de Vehículos"
          :items="tipoVehiculos"
          v-model="vehiculosSeleccionados"
          multiple
          chips
          deletable-chips
          dense
          :disabled="catShow"
        ></v-autocomplete>
        <v-btn
          v-show="!catShow"
          class="btn-grabar"
          color="Green"
          @click="
            editarCategoria();
            categoriaDialog = false;
          "
        >
          <span style="color: white;">Guardar</span>
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addCategoria" width="650px">
      <v-card class="card" style="width: 100%;">
        <v-text-field
          label="Categorías"
          v-model="newCategoria"
          :disabled="catShow"
        ></v-text-field>
        <v-autocomplete
          label="Tipos de Vehículos"
          :items="tipoVehiculos"
          v-model="newVehiculos"
          multiple
          chips
          deletable-chips
          dense
          :disabled="catShow"
        ></v-autocomplete>
        <v-btn
          v-show="!catShow"
          class="btn-grabar"
          color="Green"
          @click="
            agregarCategoria();
            addCategoria = false;
          "
        >
          <span style="color: white;">Guardar</span>
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="tarifaDialog" width="650px">
      <v-card class="card" style="width: 100%;">
        <v-autocomplete
          label="Nombre"
          :items="tipoTarifas"
          v-model="tipoTarifa"
          :disabled="catShow"
        ></v-autocomplete>
        <v-text-field
          label="Descripción"
          v-model="descTarifa"
          :disabled="catShow"
        ></v-text-field>
        <v-btn
          v-show="!catShow"
          class="btn-grabar"
          color="Green"
          @click="
            editarTarifa();
            tarifaDialog = false;
          "
        >
          <span style="color: white;">Guardar</span>
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="addRuta" width="650px">
      <v-card class="card" style="width: 100%;">
        <v-autocomplete
          label="Nombre"
          :items="tipoTarifas"
          v-model="newtipoTarifa"
          :disabled="catShow"
        ></v-autocomplete>
        <v-text-field
          label="Descripción"
          v-model="newdescTarifa"
          :disabled="catShow"
        ></v-text-field>
        <v-btn
          v-show="!catShow"
          class="btn-grabar"
          color="Green"
          @click="
            agregarRuta();
            addRuta = false;
          "
        >
          <span style="color: white;">Guardar</span>
        </v-btn>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showInfoDialog" width="500">
      <v-toolbar dark color="primary">
        <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
          >Vehículos Seleccionados {{ infoTypeReport }}</v-toolbar-title
        >
      </v-toolbar>
      <v-divider></v-divider>
      <v-card max-height="300" id="bodyDialogInfo">
        <div style="margin-left: 20px; margin-top: 0px">
          <div v-for="item in infoItems" :key="item.index" class="itemInfoDiv">
            <li>
              {{ item.value }}
            </li>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
const { AgGridVue } = require('ag-grid-vue');

import {
  fetchCategoriasById,
  postTarifas,
  fetchTipoVehiculos,
  fetchTarifasByRuta,
  postCategoriasByRyta,
  postTarifaById,
  insertCategoriasByRuta,
  postTarifaByRuta,
  MsResponseData,
} from './fetchData';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { split } from 'lodash';
import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import moment from 'moment';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  ColGroupDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  CsvExportParams,
  ProcessCellForExportParams,
  ICellRendererParams,
} from 'ag-grid-community';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    MantenedorGridSinCodigo,
    // TablaInfoGral,
    'ag-grid-vue': AgGridVue,
    DatePicker,
    TimePicker,
  },
})
export default class VerDetalleModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) detalleSeleccionado: any;
  @Prop({ required: true }) peajeSeleccionado: number;
  @Prop({ required: true }) verDetalle: boolean;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  readonly funcionalidad: Funcionalidades = Funcionalidades.TarifasPeajes;

  columnDefs: Array<ColDef | ColGroupDef> = [];
  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  tipotarifa: string = '';
  newtipoTarifa: string = '';
  inicio: any = null;
  fin: any = null;
  fechainicio: any = null;
  fechafin: any = null;
  precio: number = 0;
  dia: string = '';
  dias: any = [];
  categoriaDialog: boolean = false;
  tarifaDialog: boolean = false;
  categoriaSeleccionada: string = '';
  vehiculosSeleccionados: any = [];
  confirm: boolean = false;
  mindate: any = moment().format('YYYY-MM-DD h:mm:ss a');
  showInfoDialog: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';
  tipoVehiculos: any = [];
  params: any = [];
  idCategoria: any = '';
  id_ruta: number = 0;
  idTarifa: any = '';
  descTarifa: any = '';
  newdescTarifa: any = '';
  tipoTarifa: any = '';
  catShow: boolean = false;
  addRuta: boolean = false;
  addCategoria: boolean = false;
  newCategoria: any = '';
  newVehiculos: any = [];

  gridApi: GridApi = null;
  gridApiRuta: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Categoría',
        field: 'NOM_CATEGORIA',
        cellStyle: { textAlign: 'left' },
        Width: 100,
        resizable: false,
      },
      {
        headerName: 'Tipos de Vehículo',
        field: 'NOM_TIPOVEHICULO',
        width: 500,
        cellStyle: () => {
          return { cursor: 'pointer' };
        },
        onCellClicked: this.handleClickInfo,
        columnGroupShow: 'closed',
      },
    ].map(x => ({
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onModelUpdated: this.onModelUpdated,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };
  readonly gridOptionsRuta: GridOptions = {
    columnDefs: [
      {
        headerName: 'ID Tipo Tarifa',
        field: 'id_tipotarifa',
        cellStyle: { textAlign: 'left' },
        Width: 100,
        resizable: false,
      },
      {
        headerName: 'Tipo Tarifa',
        field: 'nom_tipotarifa',
        cellStyle: { textAlign: 'left' },
        Width: 100,
        resizable: false,
      },
      {
        headerName: 'Descripción',
        field: 'desc_tipotarifa',
        width: 500,
        cellStyle: () => {
          return { cursor: 'pointer' };
        },
        // onCellClicked: this.handleClickInfo,
        columnGroupShow: 'closed',
      },
    ].map(x => ({
      hide: false,
      ...x,
    })),
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReadyRuta,
    onModelUpdated: this.onModelUpdated,
    processCellForClipboard: ({ value }) => {
      return value instanceof moment
        ? this.formatFecha(value as moment.Moment)
        : value;
    },
  };
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
    //@ts-ignore
    if (this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  handleClickInfo(event: any) {
    var itemsInfo: any[] = [];
    if (event.value != '' && event.value != undefined && event.value != null) {
      for (var key in event.value) {
        if (event.value.hasOwnProperty(key)) {
          itemsInfo.push({ key: key, value: event.value[key] });
        }
      }
    }
    this.infoItems = itemsInfo;
    this.infoTypeReport = event.data.nombre_reporte;
    this.showInfoDialog = true;
  }

  cellInfo(event: any) {
    var str = '';
    if (event.value != '' && event.value != undefined && event.value != null) {
      for (var key in event.value) {
        if (event.value.hasOwnProperty(key)) {
          str += event.value[key] + ', ';
        }
      }
    }
  }

  tipoTarifas = ['TBFP', 'TBP', 'TS', 'TN'];

  seleccionado: number = 0;

  handleCerrar() {
    this.$emit('cerrar');
  }

  sendData() {
    // this.enviaDatos(this.peajeSeleccionado, this.detalleSeleccionado);
    // this.handleCerrar();
  }

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }
  handleGridReadyRuta(event: GridReadyEvent) {
    this.gridApiRuta = event.api;
  }

  async enviaDatos(id_peaje: number, data: any) {
    this.MsResponseData = (await this.postTarifas(id_peaje, data)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.$store.commit('setApplicationUptaded');
          this.handleCerrar();
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  postTarifas(id_peaje: number, data: any) {
    this.showLoading();
    return postTarifas(id_peaje, data)
      .catch(error => {
        this.$snotify.error('Error de conexión');
        return;
      })
      .finally(() => this.hideLoading());
  }

  handleShowPermisos(selected: number) {
    this.seleccionado = selected;
  }

  minfecha() {
    if (this.fechainicio == null) {
      return this.mindate;
    } else {
      return moment(this.fechainicio);
    }
  }

  showLoading() {
    this.requestsStart += 1;
    if (this.requestsStart == 1) {
      this.loadingService.showLoading();
    }
  }
  hideLoading() {
    this.requestsStart -= 1;
    if (this.requestsStart == 0) {
      this.loadingService.hideLoading();
    }
  }

  mounted() {
    this.id_ruta = this.detalleSeleccionado;
    this.buscaCategorias(this.id_ruta);
    this.buscaTarifas(this.id_ruta);
    this.buscaTipoVehiculos();
  }

  // cambiarEstado(index: number, estado: number) {
  //   this.detalleSeleccionado[this.seleccionado][index]['estado'] = estado;
  //   if (estado == 2) {
  //     this.detalleSeleccionado[this.seleccionado][index]['css'] =
  //       'border:1px solid red;width: 97%; padding: 5%; display: flex; margin-bottom: 15px;';
  //   } else {
  //     this.detalleSeleccionado[this.seleccionado][index]['css'] =
  //       'width: 97%; padding: 5%; display: flex; margin-bottom: 15px;';
  //   }
  // }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClickDetalle);
    actionsEvent.onVerDetalle(this.handleVerClickDetalle);
  }

  handleEditarClickDetalle(params: ICellRendererParams) {
    this.catShow = false;
    this.params = params.data;
    if (this.params.ID_CATEGORIA != null) {
      this.idCategoria = this.params.ID_CATEGORIA;
      this.categoriaSeleccionada = this.params.NOM_CATEGORIA;
      this.vehiculosSeleccionados = this.params.NOM_TIPOVEHICULO;
      this.categoriaDialog = true;
    }
    if (this.params.nom_tipotarifa != null) {
      this.tipoTarifa = this.params.nom_tipotarifa;
      this.descTarifa = this.params.desc_tipotarifa;
      this.idTarifa = this.params.id_tipotarifa;
      this.tarifaDialog = true;
    }
  }

  handleVerClickDetalle(params: ICellRendererParams) {
    this.catShow = true;
    this.params = params.data;
    if (this.params.ID_CATEGORIA != null) {
      this.idCategoria = this.params.ID_CATEGORIA;
      this.categoriaSeleccionada = this.params.NOM_CATEGORIA;
      this.vehiculosSeleccionados = this.params.NOM_TIPOVEHICULO;
      this.categoriaDialog = true;
    }
    if (this.params.nom_tipotarifa != null) {
      this.tipoTarifa = this.params.nom_tipotarifa;
      this.descTarifa = this.params.desc_tipotarifa;
      this.idTarifa = this.params.id_tipotarifa;
      this.tarifaDialog = true;
    }
  }

  agregarRuta() {
    if (this.newtipoTarifa == '' || this.newdescTarifa == '') {
      this.$snotify.error('Por favor Complete todos los Campos.', {
        timeout: 3000,
      });
    } else {
      var l = {
        NOM_TIPOTARIFA: this.newtipoTarifa,
        DESC_TIPOTARIFA: this.newdescTarifa,
        ID_RUTA: this.id_ruta,
      };
      console.log(l);
      this.EnviaTarifaByRuta(l);
    }
    this.newdescTarifa = '';
    this.newtipoTarifa = '';
  }

  agregarCategoria() {
    if (this.newCategoria == '' || this.newVehiculos == '') {
      this.$snotify.error('Por favor Complete todos los Campos.', {
        timeout: 3000,
      });
    } else {
      var l = {
        ID_CATEGORIA: this.newCategoria,
        NOM_VEHICULOS: this.newVehiculos,
        ID_RUTA: this.id_ruta,
      };
      console.log(l);
      this.agregaCategoriasByRyta(l);
    }
    this.newCategoria = '';
    this.newVehiculos = '';
  }

  editarCategoria() {
    var categoria = {
      id_categoria: this.idCategoria,
      nom_categoria: this.categoriaSeleccionada,
      nom_tipovehiculo: this.vehiculosSeleccionados,
    };
    console.log(categoria);
    this.enviaCategoriasByRyta(categoria);
  }

  showAdd() {
    if (this.seleccionado == 0) {
      this.addCategoria = true;
    }
    if (this.seleccionado == 1) {
      this.addRuta = true;
    }
  }

  editarTarifa() {
    var tarifa = {
      id_tipotarifa: this.idTarifa,
      nom_tipotarifa: this.tipoTarifa,
      desc_tipotarifa: this.descTarifa,
      id_ruta: this.id_ruta,
    };
    console.log(tarifa);
    this.EnviaTarifaById(tarifa);
  }

  async buscaCategorias(id: any) {
    this.MsResponseData = (await this.fetchCategorias(id)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.gridApi.setRowData(this.MsResponseData.data);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }
  async buscaTarifas(id: any) {
    this.MsResponseData = (await this.fetchTarifasbyRuta(id)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.gridApiRuta.setRowData(this.MsResponseData.data);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async enviaCategoriasByRyta(categoria: any) {
    this.MsResponseData = (await this.postCategoriasByRyta(categoria)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success('Guardado con Éxito.', {
            timeout: 3000,
          });
          this.buscaCategorias(this.id_ruta);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async agregaCategoriasByRyta(categoria: any) {
    this.MsResponseData = (await this.insertCategoriaByRuta(categoria)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success('Creado con Éxito.', {
            timeout: 3000,
          });
          this.buscaCategorias(this.id_ruta);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async EnviaTarifaById(tarifas: any) {
    this.MsResponseData = (await this.postTarifaById(tarifas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success('Guardado con Éxito.', {
            timeout: 3000,
          });
          this.buscaTarifas(this.id_ruta);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async EnviaTarifaByRuta(tarifas: any) {
    this.MsResponseData = (await this.postTarifaByRuta(tarifas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success('Creado con Éxito.', {
            timeout: 3000,
          });
          this.buscaTarifas(this.id_ruta);
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  async buscaTipoVehiculos() {
    this.MsResponseData = (await this.fetchTipoVehiculos()) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.tipoVehiculos = this.MsResponseData.data;
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  // onDelete(index: number) {
  //   if (this.detalleSeleccionado[this.seleccionado][index]['estado'] == 2) {
  //     return "color: 'error';";
  //   } else {
  //     return;
  //   }
  // }

  fetchCategorias(id: any) {
    this.showLoading();
    return fetchCategoriasById(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchTarifasbyRuta(id: any) {
    this.showLoading();
    return fetchTarifasByRuta(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }

  postCategoriasByRyta(id: any) {
    this.showLoading();
    return postCategoriasByRyta(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }
  insertCategoriaByRuta(id: any) {
    this.showLoading();
    return insertCategoriasByRuta(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }

  postTarifaById(id: any) {
    this.showLoading();
    return postTarifaById(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }

  postTarifaByRuta(id: any) {
    this.showLoading();
    return postTarifaByRuta(id)
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchTipoVehiculos() {
    this.showLoading();
    return fetchTipoVehiculos()
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }
}
</script>
<style scoped>
.card {
  width: 60%;
  margin: auto;
  padding: 1rem 5rem;
}
.btn {
  display: flex;
  justify-content: center;
}
</style>
