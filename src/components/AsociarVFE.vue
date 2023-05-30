<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="validForm"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md text-xs-center>
            <div align="left">
              <v-flex md5 xd5>
                <h2 class="h2_title">
                  Asociar Flotas, Etiquetas o Vehículos
                </h2>
              </v-flex>
            </div>
            <v-layout wrap>
              <v-flex xs12 md12 lg12>
                <v-radio-group v-model="radiosVF" row @change="selectedRB">
                  <v-radio label="Flotas" value="rdbFlota"></v-radio>
                  <v-radio label="Etiquetas" value="rdbEtiquetas"></v-radio>
                  <v-radio label="Vehículos" value="rdbVehiculos"></v-radio>
                </v-radio-group>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <v-layout wrap v-if="configAsociar == 1">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  v-model="buscarFlota"
                  label="Buscar..."
                  @input="onFilterTextBoxChangedFlotas"
                  @keydown="preventEnter"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="configAsociar == 1">
              <v-flex md12>
                <v-card>
                  <ag-grid-vue
                    style="width: 100%; height: 350px;"
                    class="ag-theme-material"
                    :columnDefs="columnDefsFlotas"
                    :rowData="flotasRespaldo"
                    rowSelection="multiple"
                    rowMultiSelectWithClick="false"
                    pagination="true"
                    paginationPageSize="10"
                    suppressRowClickSelection="true"
                    suppressCopyRowsToClipboard="true"
                    :sideBar="sideBar"
                    :localeText="localeText"
                    :postProcessPopup="onClickCell"
                    @selection-changed="onRowSelectedF"
                    :onGridReady="onGridReadyFlo"
                    :suppressCsvExport="true"
                    :suppressExcelExport="true"
                    key="gridFlo"
                    :isExternalFilterPresent="isExternalFilterPresentFlota"
                    :doesExternalFilterPass="doesExternalFilterPassFlota"
                  ></ag-grid-vue>
                </v-card>
              </v-flex>
            </v-layout>
            <v-layout wrap v-if="configAsociar == 2">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  v-model="buscarEti"
                  label="Buscar..."
                  @input="onFilterTextBoxChangedEti"
                  @keydown="preventEnter"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="configAsociar == 2">
              <v-flex md12>
                <v-card>
                  <ag-grid-vue
                    style="width: 100%; height: 350px;"
                    class="ag-theme-material"
                    :columnDefs="columnDefEtiquetas"
                    :rowData="etiquetasRespaldo"
                    rowSelection="multiple"
                    rowMultiSelectWithClick="false"
                    pagination="true"
                    paginationPageSize="10"
                    suppressRowClickSelection="true"
                    suppressCopyRowsToClipboard="true"
                    :sideBar="sideBar"
                    :localeText="localeText"
                    :postProcessPopup="onClickCell"
                    @selection-changed="onRowSelectedE"
                    :onGridReady="onGridReadyEti"
                    :suppressCsvExport="true"
                    :suppressExcelExport="true"
                    key="gridEti"
                    :isExternalFilterPresent="isExternalFilterPresentEtiqueta"
                    :doesExternalFilterPass="doesExternalFilterPassEtiqueta"
                  ></ag-grid-vue>
                </v-card>
              </v-flex>
            </v-layout>
            <v-layout wrap v-if="configAsociar == 3">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  v-model="buscarVehi"
                  label="Buscar..."
                  @input="onFilterTextBoxChangedVehi"
                  @keydown="preventEnter"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap v-if="configAsociar == 3">
              <v-flex md12>
                <v-card>
                  <ag-grid-vue
                    style="width: 100%; height: 350px;"
                    class="ag-theme-material"
                    :columnDefs="columnDefVehiculos"
                    :rowData="vehiculosRespaldo"
                    rowSelection="multiple"
                    rowMultiSelectWithClick="false"
                    pagination="true"
                    paginationPageSize="10"
                    suppressRowClickSelection="true"
                    suppressCopyRowsToClipboard="true"
                    :sideBar="sideBar"
                    :localeText="localeText"
                    :postProcessPopup="onClickCell"
                    @selection-changed="onRowSelectedV"
                    :onGridReady="onGridReadyVehi"
                    :suppressCsvExport="true"
                    :suppressExcelExport="true"
                    key="gridVehi"
                    :isExternalFilterPresent="isExternalFilterPresentVehiculo"
                    :doesExternalFilterPass="doesExternalFilterPassVehiculo"
                  ></ag-grid-vue>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue'; //
import { ServicioProxy } from '@/config/enums'; //
import config from '@/config/index'; //
import HandleErrors from '@/config/handleErrors'; //
import Confirmation from '@/components/Confirmation.vue'; //
import { Component, Prop, Watch } from 'vue-property-decorator'; //
import { Funcionalidades } from '@/config/funcionalidades'; //
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm'; //
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper'; //
import { Validator } from 'vee-validate';
import {
  AlertasInterface,
  VelocidadMaximaInterface,
  AlertaMailInterface,
} from '@/interfaces/Alertas';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { UsuariosInterface } from '@/interfaces/Usuarios';
import { EstadoEntidad } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import store from '@/store';
import ValidaRut from '@/config/validaRut';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class AsociarVFE extends Vue {
  @Prop({ default: false }) show!: boolean; //
  @Prop({ default: () => ({ id: 0, name: '', estado: 0 }) }) //
  Alerta!: AlertasInterface;

  //abstract

  //Variables globales
  $snotify: any; //
  validForm: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  loadingService = new LoadingService();
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();

  //grilla
  localeText: any = config.agGridTextos; //
  gridApi: GridApi; //
  columnApi: ColumnApi; //
  columnDefs: Array<ColDef> = []; //
  sideBar: any = config.agGridDefaultConfig; //

  created() {}

  mounted() {
    this.initialize(); //
  }

  initialize() {
    this.columnDefsFlotas = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código Flota',
        field: 'id',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Código Padre',
        field: 'padre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Padre',
        field: 'nombrePadre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefEtiquetas = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockPinned: true,
        width: 950,
        minWidth: 950,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefVehiculos = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: false,
        sortable: true,
        sort: 'desc',
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        cellRenderer: (r: any) => {
          if (r.data.checked !== undefined) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Código Flota',
        field: 'flota',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        hide: true,
      },
      {
        headerName: 'Flota',
        field: 'flotaNombre',
        lockPinned: true,
        width: 200,
        minWidth: 200,
        enablePivot: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
    ];
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.flotasAsignados = [];
    this.etiquetasAsignados = [];
    this.vehiculosAsignados = [];
    this.vehiculosRespaldo = [];
    this.flotasRespaldo = [];
    this.etiquetasRespaldo = [];
    this.radiosVF = 'rdbFlota';
    this.configAsociar = 1;
    this.buscarFlota = '';
    this.gridApiFlo.setQuickFilter('');
    this.buscarVehi = '';
    this.buscarEti = '';
    if (value) {
      this.getVehiculosFlotasEtiquetas();
    }
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  radiosVF: any = 'rdbFlota';
  configAsociar: number = 1;
  columnDefsFlotas: Array<ColDef> = [];
  columnDefEtiquetas: Array<ColDef> = [];
  columnDefVehiculos: Array<ColDef> = [];
  flotasAsignados: IFlota[] = [];
  etiquetasAsignados: IEtiqueta[] = [];
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  flotasRespaldo: IFlota[] = [];
  etiquetasRespaldo: IEtiqueta[] = [];
  vehiculosRespaldoBase: IVehiculo[] = [];
  vehiculosRespaldoTrasFiltro: IVehiculo[] = [];
  etiquetaRespaldoTrasFiltro: IEtiqueta[] = [];
  flotasRespaldoBase: IFlota[] = [];
  etiquetaRespaldoBase: IEtiqueta[] = [];
  flotaSeleccionadaPadre: IFlota[] = [];
  flotaIngresadaHija: IFlota[] = [];

  //Respaldos temporales
  vehiculosRespaldoTemporalF: IVehiculo[] = [];
  etiquetasRespaldoTemporalF: IEtiqueta[] = [];
  flotasRespaldoTemporalV: IFlota[] = [];
  etiquetasRespaldoTemporalV: IEtiqueta[] = [];
  vehiculosRespaldoTemporalE: IVehiculo[] = [];
  flotasRespaldoTemporalE: IFlota[] = [];

  todasFlotas: boolean = false;
  todasEtiquetas: boolean = false;
  todosVehiculos: boolean = false;

  axContextoReporte: AxiosVue = new AxiosVue(ServicioProxy.Reporte);
  readonly controllerReporte: string = 'Reporte';

  gridApiFlo: GridApi;
  gridApiVehi: GridApi;
  gridApiEti: GridApi;
  columnApiFlo: ColumnApi;
  columnApiVehi: ColumnApi;
  columnApiEti: ColumnApi;
  buscarFlota: string = '';
  buscarVehi: string = '';
  buscarEti: string = '';
  cargandoDatos: boolean = true;

  selectedRB(e: any) {
    switch (e) {
      case 'rdbFlota':
        this.configAsociar = 1;
        break;
      case 'rdbEtiquetas':
        this.configAsociar = 2;
        break;
      case 'rdbVehiculos':
        this.configAsociar = 3;
        break;
    }
  }

  async onGridReadyFlo(params: any) {
    this.cargandoDatos = true;
    this.gridApiFlo = params.api;
    this.columnApiFlo = params.columnApi;
    const self = this;
    await this.cargaCheckedFlotas();
    this.gridApiFlo.forEachNode(function(node: any) {
      var index = self.flotasAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiFlo.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  async onGridReadyVehi(params: any) {
    this.cargandoDatos = true;
    this.gridApiVehi = params.api;
    this.columnApiVehi = params.columnApi;
    const self = this;
    this.cargaCheckedVehiculos();
    this.gridApiVehi.forEachNode(function(node: any) {
      var index = self.vehiculosAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiVehi.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  async onGridReadyEti(params: any) {
    this.cargandoDatos = true;
    this.gridApiEti = params.api;
    this.columnApiEti = params.columnApi;
    const self = this;
    await this.cargaCheckedEtiquetas();
    this.gridApiEti.forEachNode(function(node: any) {
      var index = self.etiquetasAsignados.findIndex(x => x.id == node.data.id);
      if (index !== -1) {
        node.setSelected(true);
        //self.gridApiEti.selectNode(node, true);
      }
    });
    setTimeout(() => {
      this.cargandoDatos = false;
    }, 500);
  }

  onFilterTextBoxChangedFlotas() {
    if (this.buscarFlota.length > 1) {
      this.gridApiFlo.setQuickFilter(this.buscarFlota);
    } else {
      this.gridApiFlo.setQuickFilter('');
    }
  }

  onFilterTextBoxChangedVehi() {
    if (this.buscarVehi.length > 1) {
      this.gridApiVehi.setQuickFilter(this.buscarVehi);
    } else {
      this.gridApiVehi.setQuickFilter('');
    }
  }

  onFilterTextBoxChangedEti() {
    if (this.buscarEti.length > 1) {
      this.gridApiEti.setQuickFilter(this.buscarEti);
    } else {
      this.gridApiEti.setQuickFilter('');
    }
  }

  someFunction() {
    return true;
  }

  onRowSelectedF() {
    if (this.cargandoDatos == false) {
      this.flotasAsignados = this.gridApiFlo.getSelectedRows();
      if (this.flotasAsignados.length > 0) {
        //Se filtra el listado de vehiculos por flota seleccionada
        let respaldo = this.vehiculosRespaldo;
        if (this.etiquetasAsignados.length == 0) {
          respaldo = this.vehiculosRespaldoBase;
        } else if (
          this.etiquetasAsignados.length > 0 &&
          this.flotasAsignados.length > 1
        ) {
          respaldo = this.vehiculosRespaldoTemporalE;
        }
        this.vehiculosRespaldo = [];
        this.flotaSeleccionadaPadre = [];
        this.flotaIngresadaHija = [];
        //Se filtran los vehiculos de las subflotas seleccionadas
        for (let i = 0; i <= this.flotasAsignados.length - 1; i++) {
          var flotaseleccionada = this.flotasRespaldo.find(
            x => x.id == this.flotasAsignados[i].id
          );
          if (flotaseleccionada != undefined) {
            if (flotaseleccionada.padre != null) {
              let vehiculosAIngresar = respaldo.filter(
                x => x.flota == flotaseleccionada.id
              );
              for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
                var index = this.vehiculosRespaldo.findIndex(
                  x => x.id == vehiculosAIngresar[i].id
                );
                if (index === -1) {
                  this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
                }
              }
              this.flotaIngresadaHija.push(flotaseleccionada);
            } else {
              this.flotaSeleccionadaPadre.push(flotaseleccionada);
            }
          }
        }
        //Se filtran los vehiculos de las flotas padre seleccioandas
        for (let i = 0; i <= this.flotaSeleccionadaPadre.length - 1; i++) {
          var hijasIngresadas = this.flotaIngresadaHija.filter(
            x => x.padre == this.flotaSeleccionadaPadre[i].id
          );
          let vehiculosAIngresar = respaldo.filter(
            x => x.flota == this.flotaSeleccionadaPadre[i].id
          );
          for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
            var inde = this.vehiculosRespaldo.findIndex(
              x => x.id == vehiculosAIngresar[i].id
            );
            if (inde === -1) {
              this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
            }
          }
          if (hijasIngresadas.length == 0) {
            let flotasHijas = this.flotasRespaldo.filter(
              x => x.padre == this.flotaSeleccionadaPadre[i].id
            );
            flotasHijas.forEach((f: any) => {
              this.vehiculosRespaldo.push(
                ...respaldo.filter(x => x.flota == f.id)
              );
            });
          }
        }

        //filtraran las etiquetas segun las flotas seleccionadas
        let respaldoEtiqueta = this.etiquetasRespaldo;
        if (this.vehiculosAsignados.length == 0) {
          respaldoEtiqueta = this.etiquetaRespaldoBase;
        } else if (
          this.vehiculosAsignados.length > 0 &&
          this.flotasRespaldo.length > 1
        ) {
          respaldoEtiqueta = this.etiquetasRespaldoTemporalV;
        }

        this.etiquetasRespaldo = [];
        for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
          let etiquetasVehiculo = this.vehiculosRespaldo[i].etiquetas;
          for (let y = 0; y <= etiquetasVehiculo.length - 1; y++) {
            let etiquetasAingresar = respaldoEtiqueta.find(
              x => x.id == etiquetasVehiculo[y]
            );
            if (etiquetasAingresar != undefined) {
              var en = this.etiquetasRespaldo.findIndex(
                x => x.id == etiquetasAingresar.id
              );
              if (en === -1) {
                this.etiquetasRespaldo.push(etiquetasAingresar);
              }
            }
          }
        }
        this.vehiculosRespaldoTrasFiltro = this.vehiculosRespaldo;
        this.etiquetaRespaldoTrasFiltro = this.etiquetasRespaldo;
        //Si existia un vehiculo seleccionado de una flota y esta es desmarcada se eliminara el vehiculo de los asignados
        if (this.vehiculosAsignados.length > 0) {
          for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
            var ind = this.vehiculosRespaldo.findIndex(
              x => x.id == this.vehiculosAsignados[i].id
            );
            if (ind === -1) {
              this.vehiculosAsignados.splice(i, 1);
            }
          }
        }
        this.vehiculosRespaldoTemporalF = this.vehiculosRespaldo;
        this.etiquetasRespaldoTemporalF = this.etiquetasRespaldo;
      } else if (this.flotasAsignados.length === 0) {
        if (this.vehiculosAsignados.length == 0) {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
        } else {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
          this.onRowSelectedV();
        }

        if (this.etiquetasAsignados.length == 0) {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
        } else {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
          this.onRowSelectedE();
        }
      }
      this.cargaCheckedFlotas();
    }
  }

  onRowSelectedE() {
    if (this.cargandoDatos == false) {
      this.etiquetasAsignados = this.gridApiEti.getSelectedRows();
      if (this.etiquetasAsignados.length > this.etiquetasRespaldo.length) {
        this.etiquetasAsignados = this.etiquetasRespaldo;
      }
      if (this.etiquetasAsignados.length > 0) {
        // Se filtra el listado de vehiculos por etiqueta seleccionada
        let respaldo = this.vehiculosRespaldo;
        if (this.flotasAsignados.length == 0) {
          respaldo = this.vehiculosRespaldoBase;
        } else if (
          this.flotasAsignados.length > 0 &&
          this.etiquetasAsignados.length > 1
        ) {
          respaldo = this.vehiculosRespaldoTemporalF;
        }

        this.vehiculosRespaldo = [];
        for (let i = 0; i <= this.etiquetasAsignados.length - 1; i++) {
          let vehiculosAIngresar = respaldo.filter(x =>
            x.etiquetas.includes(this.etiquetasAsignados[i].id)
          );
          for (let i = 0; i <= vehiculosAIngresar.length - 1; i++) {
            var index = this.vehiculosRespaldo.findIndex(
              x => x.id == vehiculosAIngresar[i].id
            );
            if (index === -1) {
              this.vehiculosRespaldo.push(vehiculosAIngresar[i]);
            }
          }
        }
        //Se filtran las flotas por etiqueta seleccionada
        let respaldoFlotas = this.flotasRespaldo;
        if (this.vehiculosAsignados.length == 0) {
          respaldoFlotas = this.flotasRespaldoBase;
        } else if (
          this.vehiculosAsignados.length > 0 &&
          this.etiquetasAsignados.length > 1
        ) {
          respaldoFlotas = this.flotasRespaldoTemporalV;
        }
        this.flotasRespaldo = [];
        for (let i = 0; i <= this.vehiculosRespaldo.length - 1; i++) {
          //let vehiculoSeleccionado = this.vehiculosRespaldo.find(x => x.id == this.vehiculosRespaldo[i].id);
          let flota = respaldoFlotas.find(
            x => x.id == this.vehiculosRespaldo[i].flota
          );
          if (flota != undefined) {
            var inde = this.flotasRespaldo.findIndex(x => x.id == flota.id);
            if (inde === -1) {
              this.flotasRespaldo.push(flota);
            }
          }
        }
        this.vehiculosRespaldoTemporalE = this.vehiculosRespaldo;
        this.flotasRespaldoTemporalE = this.flotasRespaldo;
      } else if (this.etiquetasAsignados.length === 0) {
        if (this.flotasAsignados.length == 0) {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
        } else {
          this.flotasRespaldo = this.flotasRespaldoBase;
          this.onRowSelectedF();
        }

        if (this.vehiculosAsignados.length == 0) {
          this.flotasRespaldo = this.flotasRespaldoBase;
        } else {
          this.vehiculosRespaldo = this.vehiculosRespaldoBase;
          this.onRowSelectedV();
        }
      }
      this.cargaCheckedEtiquetas();
    }
  }

  onRowSelectedV() {
    if (this.cargandoDatos == false) {
      this.vehiculosAsignados = this.gridApiVehi.getSelectedRows();
      if (this.vehiculosAsignados.length > 0) {
        let respaldo = this.flotasRespaldo;
        if (this.etiquetasAsignados.length == 0) {
          respaldo = this.flotasRespaldoBase;
        } else if (
          this.etiquetasAsignados.length > 0 &&
          this.vehiculosAsignados.length > 1
        ) {
          respaldo = this.flotasRespaldoTemporalE;
        }

        let respaldoEtiqueta = this.etiquetasRespaldo;
        if (this.flotasAsignados.length == 0) {
          respaldoEtiqueta = this.etiquetaRespaldoBase;
        } else if (
          this.flotasAsignados.length > 0 &&
          this.vehiculosAsignados.length > 1
        ) {
          respaldoEtiqueta = this.etiquetasRespaldoTemporalF;
        }

        this.flotasRespaldo = [];
        this.etiquetasRespaldo = [];
        for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
          //Se filtran las flotas por los vehiculos seleccionadas
          let vehiculoSeleccionado = this.vehiculosRespaldo.find(
            x => x.id == this.vehiculosAsignados[i].id
          );
          if (vehiculoSeleccionado != undefined) {
            let flota = respaldo.find(x => x.id == vehiculoSeleccionado.flota);
            if (flota != undefined) {
              var index = this.flotasRespaldo.findIndex(x => x.id == flota.id);
              if (index === -1) {
                this.flotasRespaldo.push(flota);
              }
            }
          }
          //filtraran las etiquetas segun los vehiculos seleccionados
          let etiquetasVehiculo = this.vehiculosAsignados[i].etiquetas;
          for (let y = 0; y <= etiquetasVehiculo.length - 1; y++) {
            let etiquetasAingresar = respaldoEtiqueta.find(
              x => x.id == etiquetasVehiculo[y]
            );
            if (etiquetasAingresar != undefined) {
              var en = this.etiquetasRespaldo.findIndex(
                x => x.id == etiquetasAingresar.id
              );
              if (en === -1) {
                this.etiquetasRespaldo.push(etiquetasAingresar);
              }
            }
          }
        }
        this.etiquetasRespaldoTemporalV = this.etiquetasRespaldo;
        this.flotasRespaldoTemporalV = this.flotasRespaldo;
      } else if (this.vehiculosAsignados.length === 0) {
        if (this.etiquetasAsignados.length == 0) {
          this.flotasRespaldo = this.flotasRespaldoBase;
        } else {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
          this.onRowSelectedE();
        }

        if (this.flotasAsignados.length == 0) {
          this.etiquetasRespaldo = this.etiquetaRespaldoBase;
        } else {
          this.flotasRespaldo = this.flotasRespaldoBase;
          this.onRowSelectedF();
        }
      }
      this.cargaCheckedVehiculos();
    }
  }

  async cargaCheckedFlotas() {
    await this.flotasRespaldo.forEach(flota => {
      let exists: any = this.flotasAsignados.filter(
        (x: any) => x.id === flota.id
      );
      if (exists.length == 0) {
        flota.checked = false;
      } else {
        flota.checked = true;
      }
    });

    if (this.gridApiFlo != undefined) {
      this.gridApiFlo.refreshCells({ force: true });
    }
  }

  async cargaCheckedVehiculos() {
    await this.vehiculosRespaldo.forEach(vehiculo => {
      let exists: any = this.vehiculosAsignados.filter(
        (x: any) => x.id === vehiculo.id
      );
      if (exists.length == 0) {
        vehiculo.checked = false;
      } else {
        vehiculo.checked = true;
      }
    });

    if (this.gridApiVehi != undefined) {
      this.gridApiVehi.refreshCells({ force: true });
    }
  }

  async cargaCheckedEtiquetas() {
    await this.etiquetasRespaldo.forEach(etiqueta => {
      let exists: any = this.etiquetasAsignados.filter(
        (x: any) => x.id === etiqueta.id
      );
      if (exists.length == 0) {
        etiqueta.checked = false;
      } else {
        etiqueta.checked = true;
      }
    });

    if (this.gridApiEti != undefined) {
      this.gridApiEti.refreshCells({ force: true });
    }
  }

  async getVehiculosFlotasEtiquetas() {
    try {
      this.loadingService.showLoading();
      const response = await this.axContextoReporte.http.get(
        `${this.controllerReporte}/${this.usuarioId}/${this.clienteId}`
      );
      this.vehiculosRespaldo = response.data.vehiculos;
      this.flotasRespaldo = response.data.flotas;
      this.etiquetasRespaldo = response.data.etiquetas;
      this.vehiculosRespaldoBase = response.data.vehiculos;
      this.flotasRespaldoBase = response.data.flotas;
      this.etiquetaRespaldoBase = response.data.etiquetas;
    } catch (error) {
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
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentFlota(): boolean {
    return true;
  }

  doesExternalFilterPassFlota(node: RowNode): boolean {
    if (this.flotasRespaldo.length > 0 && this.buscarFlota.length > 1) {
      let busqueda = this.buscarFlota.toLowerCase();
      return (
        node.data.nombre.toLowerCase().includes(busqueda) ||
        node.data.nombrePadre.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentEtiqueta(): boolean {
    return true;
  }

  doesExternalFilterPassEtiqueta(node: RowNode): boolean {
    if (this.etiquetasRespaldo.length > 0 && this.buscarEti.length > 1) {
      let busqueda = this.buscarEti.toLowerCase();
      return node.data.nombre.toLowerCase().includes(busqueda);
    }
    return true;
  }
  //---

  //DEMO: Filtros Grillas Internas
  isExternalFilterPresentVehiculo(): boolean {
    return true;
  }

  doesExternalFilterPassVehiculo(node: RowNode): boolean {
    if (this.vehiculosRespaldo.length > 0 && this.buscarVehi.length > 1) {
      let busqueda = this.buscarVehi.toLowerCase();
      return (
        node.data.unidad.toLowerCase().includes(busqueda) ||
        node.data.flotaNombre.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
  //---
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
html {
  overflow-y: hidden;
}
</style>
