<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary" v-if="!soloVisualizacion" fixed>
          <v-btn icon dark @click="dialogConfirmacionClose = true">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title
            v-if="
              vehiculosAsignados.length >= 0 && subflotasAsignados.length > 0
            "
          >
            Eliminar asociaciones de la Flota:
            {{ flota.nombre }}
          </v-toolbar-title>
          <v-toolbar-title v-else-if="vehiculosAsignados.length >= 0">
            Eliminar asociaciones de la Flota:
            {{ flota.nombre }}
          </v-toolbar-title>
          <v-toolbar-title v-else-if="vehiculosAsignados.length >= 0">
            Eliminar asociaciones de la Flota:
            {{ flota.nombre }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn depressed class="btn-grabar" @click="confirmacion()"
              >Guardar y continuar</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>

        <v-toolbar dark color="primary" v-if="soloVisualizacion">
          <v-btn icon dark @click="closeModal(false)">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Flota: {{ flota.nombre }}</v-toolbar-title>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div align="center">
          <v-container grid-list-md text-xs-center>
            <div v-if="showVehiculosGrid">
              <v-card>
                <v-layout row wrap>
                  <div align="left">
                    <v-flex md12>
                      <h2 class="h2_title" v-if="!soloVisualizacion">
                        &nbsp;&nbsp;&nbsp;&nbsp;Desasociar Vehículos
                      </h2>
                      <h2 class="h2_title" v-if="soloVisualizacion">
                        &nbsp;&nbsp;&nbsp;&nbsp;Vehículos Asociados
                      </h2>
                      <br />
                    </v-flex>
                  </div>
                </v-layout>
                <v-divider></v-divider>
                <br />
                <v-layout row wrap>
                  <v-flex md12>
                    <ag-grid-vue
                      style="width: 100%; height: 300px;font-family: 'Asap', sans-serif;"
                      class="ag-theme-material"
                      :columnDefs="columnDefs"
                      :rowData="vehiculosAsignados"
                      rowSelection="multiple"
                      rowMultiSelectWithClick="false"
                      pagination="true"
                      paginationPageSize="10"
                      suppressRowClickSelection="true"
                      :sideBar="sideBar"
                      :localeText="localeText"
                      :gridReady="onGridReady"
                      :suppressCsvExport="true"
                      :suppressExcelExport="true"
                    ></ag-grid-vue>
                  </v-flex>
                </v-layout>
              </v-card>
            </div>

            <div v-if="showSubFlotasGrid">
              <v-layout row wrap>
                <div align="left">
                  <v-flex md12>
                    <h2 class="h2_title">Desasociar Subflotas</h2>
                  </v-flex>
                </div>
              </v-layout>
              <v-divider></v-divider>
              <br />
              <v-layout row wrap>
                <v-flex md12>
                  <ag-grid-vue
                    style="width: 100%; height: 300px;font-family: 'Asap', sans-serif;"
                    class="ag-theme-material"
                    :columnDefs="columnDefsSF"
                    :rowData="subflotasAsignados"
                    rowSelection="multiple"
                    rowMultiSelectWithClick="false"
                    pagination="true"
                    paginationPageSize="10"
                    suppressRowClickSelection="true"
                    :sideBar="sideBarSF"
                    :localeText="localeText"
                    :gridReady="onGridReadySF"
                    :suppressCsvExport="true"
                    :suppressExcelExport="true"
                  ></ag-grid-vue>
                </v-flex>
              </v-layout>
            </div>
          </v-container>
        </div>

        <app-confirmacion
          :show="dialogConfirmacion"
          titulo="Confirmación"
          :mensaje="textoDialog"
          v-on:modalConfirmationEmit="confirmCallback($event)"
          textoBtnSi="Aceptar"
          textoBtnNo="Cancelar"
        ></app-confirmacion>

        <app-confirmacion
          :show="dialogConfirmacionClose"
          :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
          :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
          v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
          :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
          :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
        ></app-confirmacion>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { FlotaInterface } from '@/interfaces/Flota';
import { IVehiculo } from '@/interfaces/Vehiculos';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { EstadoEntidad } from '@/config/enums';
import { GridApi, ColumnApi, ColDef, GridReadyEvent } from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class FlotasModalDesasociarVehiculos extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  flota!: FlotaInterface;
  @Prop({ default: false }) soloVisualizacion!: boolean;

  $snotify: any;
  dialog: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  vehiculosAsignados: IVehiculo[] = [];
  vehiculosRespaldo: IVehiculo[] = [];
  vehiculosAsignadosResp: IVehiculo[] = [];
  subflotasAsignados: FlotaInterface[] = [];
  subflotasRespaldo: FlotaInterface[] = [];
  subflotasAsignadosResp: FlotaInterface[] = [];
  dialogConfirmacion: boolean = false;
  localeText: any = config.agGridTextos;
  textoDialog: string = '';
  idCliente: number = 0;

  showVehiculosGrid: boolean = false;
  showSubFlotasGrid: boolean = false;

  gridApi: GridApi;
  gridApiSF: GridApi;
  columnApi: ColumnApi;
  columnApiSF: ColumnApi;
  columnDefs: Array<ColDef> = [];
  columnDefsSF: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  sideBarSF: any = config.agGridDefaultConfig;

  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  flotaPorDefecto: FlotaInterface[] = [];
  flotaPorDefectoNombre: string = '';
  readonly controllerFlota: string = 'flota';
  dialogConfirmacionClose: boolean = false;

  mounted() {
    this.initialize();
    //this.obtenerFlotaPorDefecto();
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.showVehiculosGrid = false;
    this.showSubFlotasGrid = false;
    this.idCliente = config.getClienteSesion();

    if (this.dialog) {
      this.obtenerFlotaPorDefecto();
      //recupera vehiculos asignados a la flota
      this.axiosVehiculo.http
        .get('flota/' + this.flota.id + '/vehiculo/')
        .then(res => {
          this.vehiculosAsignados = res.data;
          this.vehiculosAsignadosResp = Object.assign(
            [],
            this.vehiculosAsignados
          );

          if (this.vehiculosAsignados.length > 0) {
            this.showVehiculosGrid = true;
            this.textoDialog =
              'Los Vehículos desasociados de ' +
              this.flota.nombre +
              ' serán asociados a la flota ' +
              this.flotaPorDefectoNombre +
              ' ¿Confirma desasociar los Vehículos removidos de esta Flota?';
          }

          if (this.soloVisualizacion) {
            for (let i: number = this.columnDefs.length - 1; i >= 0; i--) {
              if (this.columnDefs[i].headerName === 'Desasociar') {
                this.columnDefs.splice(i, 1);
                break;
              }
            }
          }

          //recupera subflotas asignadas a la flota
          this.axiosVehiculo.http
            .get('flota/' + this.flota.id + '/subflota')
            .then(res => {
              this.subflotasAsignados = res.data;
              this.subflotasAsignadosResp = Object.assign(
                [],
                this.subflotasAsignados
              );

              if (
                this.subflotasAsignados.length > 0 &&
                this.vehiculosAsignados.length > 0
              ) {
                this.showSubFlotasGrid = true;
                this.textoDialog =
                  'Los Vehículos desasociados de ' +
                  this.flota.nombre +
                  ' serán asociados a la flota ' +
                  this.flotaPorDefectoNombre +
                  ' ¿Confirma desasociar los Vehículos y Subflotas removidos de esta Flota?';
              } else if (this.subflotasAsignados.length > 0) {
                this.showSubFlotasGrid = true;
                this.textoDialog =
                  '¿Confirma desasociar las Subflotas de esta Flota?';
              }
            })
            .catch(error => {
              this.handleErrors.showError(error);
            });
        })
        .catch(error => {
          this.handleErrors.showError(error);
        });
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onGridReadySF(params: GridReadyEvent) {
    this.gridApiSF = params.api;
    this.columnApiSF = params.columnApi;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEmit', val);
    this.dialog = false;
  }

  getVehiculos() {
    this.axiosVehiculo.http
      .get('vehiculo/')
      .then(res => {
        this.vehiculosRespaldo = res.data;
      })
      .catch(error => {
        this.handleErrors.showError(error);
      });
  }

  createButtonCellVehiculo(params: any) {
    let evento = this.removerVehiculoAsignacion;
    var item = this.vehiculosAsignados.filter(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light" style="color:black;">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item[0]);
    });

    return eButton;
  }

  createButtonCellSubFlotas(params: any) {
    let evento = this.removerSubFlotasAsignacion;
    var item = this.subflotasAsignados.filter(x => x.id == params.data.id);

    var eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');
    eButton.setAttribute('class', 'v-btn v-btn--flat v-btn--icon theme--light');
    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light" style="color:black;">delete</i></div>';

    eButton.addEventListener('click', function() {
      evento(item[0]);
    });

    return eButton;
  }

  removerVehiculoAsignacion(item: IVehiculo) {
    for (let i = 0; i <= this.vehiculosAsignados.length - 1; i++) {
      if (this.vehiculosAsignados[i].id == item.id) {
        this.vehiculosAsignados.splice(i, 1);
        break;
      }
    }
  }

  removerSubFlotasAsignacion(item: FlotaInterface) {
    for (let i = 0; i <= this.subflotasAsignados.length - 1; i++) {
      if (this.subflotasAsignados[i].id == item.id) {
        this.subflotasAsignados.splice(i, 1);
        break;
      }
    }
  }

  confirmacion() {
    if (
      this.vehiculosAsignados.length > 0 &&
      this.subflotasAsignados.length > 0
    ) {
      this.$snotify.warning(
        'Debe desasociar los Vehículos y Subflotas para eliminar la Flota.'
      );
    } else if (this.subflotasAsignados.length > 0) {
      this.$snotify.warning(
        'Debe desasociar todas las Subflotas para eliminar la Flota.'
      );
    } else if (this.vehiculosAsignados.length > 0) {
      this.$snotify.warning(
        'Debe desasociar todos los Vehículos para eliminar la Flota.'
      );
    } else {
      this.dialogConfirmacion = true;
    }
  }

  confirmCallback(val: boolean) {
    if (val !== null) {
      this.dialogConfirmacion = false;
      if (val) {
        this.closeModal(true);
      } else {
        this.confirmCallbackConfirm(true);
      }
    } else {
      this.dialogConfirmacion = false;
    }
  }

  eliminarAsociacioneaSubFlotas() {
    //Elimina asociaciones subflotas
    if (this.showSubFlotasGrid) {
      let index = 0;
      let he = new HandleErrors();
      let subflotasEliminar: any = [];

      this.subflotasAsignadosResp.forEach((subflota: any) => {
        let exists = this.subflotasAsignados.filter(z => z.id == subflota.id);
        if (exists.length == 0) {
          subflotasEliminar.push({
            Id: subflota.id,
            ClienteId: subflota.clienteId,
            ResponsableFlotaId: 0,
            ResponsableMantenimientoFlotaId: 0,
            Nombre: subflota.nombre,
            Descripcion: subflota.descripcion,
            Estado: EstadoEntidad.Activo,
          });
        }
      });

      if (subflotasEliminar.length > 0) {
        this.axiosVehiculo.http
          .delete('flota/' + this.flota.id + '/subflota/', {
            data: subflotasEliminar,
          })
          .then(res => {
            this.closeModal(true);
          })
          .catch(err => {
            this.$snotify.error(
              'Ocurrió un error al remover la asociación con Subflotas.'
            );
          });
      } else {
        this.closeModal(true);
      }
    } else {
      this.closeModal(true);
    }
  }

  obtenerFlotaPorDefecto() {
    this.axiosVehiculo.http
      //.get(this.controllerFlota)
      .get(`${this.controllerFlota}/FlotasPorCliente/`)
      .then(response => {
        //const clienteId = config.getClienteSesion();
        this.flotaPorDefecto = response.data.filter(
          (x: any) =>
            //x.clienteId == clienteId &&
            x.estado == EstadoEntidad.Sistema
        );
        if (this.flotaPorDefecto.length > 0) {
          this.flotaPorDefectoNombre = this.flotaPorDefecto[0].nombre;
        } else {
          this.flotaPorDefectoNombre = 'por Defecto';
        }
      })
      .catch(error => {
        this.$snotify.error(
          'Ha ocurrido un problema al consultar la Flota por defecto.'
        );
      });
  }

  createButtonCellVehiculoCompartido(params: any) {
    if (this.vehiculosAsignados.length > 0) {
      if (params.data.esCompartido === true) {
        const compartidoPor: any = this.vehiculosAsignados.find(
          (x: any) => x.id === params.data.id
        );
        var eButton = document.createElement('i');
        eButton.setAttribute(
          'title',
          'Vehículo compartido por: ' + compartidoPor.compartidoPor
        );
        eButton.innerHTML =
          '<i aria-hidden="true" style="color:#808080" class="v-icon material-icons v-alert__icon">directions_car</i>';
        return eButton;
      }
    }
  }

  initialize() {
    this.columnDefs = [
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        minWidth: 80,
        resizable: true,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: '',
        cellRenderer: this.createButtonCellVehiculoCompartido,
        enablePivot: false,
        lockPinned: true,
        suppressMenu: false,
        width: 70,
        minWidth: 80,
        filter: false,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Tipo Vehículo',
        field: 'vehiculoTipo.nombre',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Estado',
        field: 'estado',
        minWidth: 80,
        cellRenderer: (r: any) => {
          return EstadoEntidad[r.data.estado];
        },
        resizable: true,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Desasociar',
        cellRenderer: this.createButtonCellVehiculo,
        enablePivot: false,
        minWidth: 80,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        pinned: 'right',
        cellStyle: { textAlign: 'left' },
      },
    ];

    this.columnDefsSF = [
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Descripción',
        field: 'descripcion',
        resizable: true,
        sortable: true,
        minWidth: 80,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Código Cliente',
        field: 'clienteId',
        resizable: true,
        minWidth: 80,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estado',
        minWidth: 80,
        cellRenderer: (r: any) => {
          return EstadoEntidad[r.data.estado];
        },
        resizable: true,
        sortable: true,
        lockPinned: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Desasociar',
        cellRenderer: this.createButtonCellSubFlotas,
        enablePivot: false,
        resizable: false,
        minWidth: 80,
        sortable: false,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        pinned: 'right',
        cellStyle: { textAlign: 'left' },
      },
    ];
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
