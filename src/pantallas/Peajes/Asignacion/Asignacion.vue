<template>
  <div class="tarifas">
    <!-- <v-flex sm12 md12 style="width: 30%;">
      <v-text-field
        v-model="buscarPeaje"
        label="Buscar..."
        @input="onFilterPeajes"
        @keydown="preventEnter"
      ></v-text-field>
    </v-flex> -->
    <fieldset
      style="width: 100%;margin-bottom: 20px;display: flex;height: 95%;border: 1px solid rgb(220, 220, 220);"
    >
      <legend style="margin-left: 0.3rem; color: #9e9e9e;font-size: 0.8rem;">
        Asignar Vehículos
      </legend>
      <v-flex
        style="padding-top: 20px; padding-left: 40px; padding-right: 40px; padding-bottom: 20px;"
      >
        <v-autocomplete
          v-validate="'required'"
          v-model="flotasSeleccionados"
          :items="flotas"
          label="Flotas"
          multiple
          chips
          deletable-chips
          dense
          @change="buscarVehiculos(flotasSeleccionados)"
        >
        </v-autocomplete>
        <v-autocomplete
          v-validate="'required'"
          v-model="vehiculosSeleccionados"
          :items="vehiculos"
          label="Vehículos"
          multiple
          chips
          deletable-chips
          dense
        >
        </v-autocomplete>
        <v-btn color="#FFE700" @click="asignarVehiculos()"
          >Asignar Vehículos</v-btn
        >
      </v-flex>
    </fieldset>
    <!-- <div class="gridcard rounded-card">
      <MantenedorGridSinCodigo
        :grid-options="gridOptions"
        :funcionalidad-id="funcionalidad"
      />
    </div> -->
    <!-- <VerDetalleModal
      v-if="mostrarModalVerDetalle"
      @cerrar="handleCierreModalVerDetalle"
      :detalleSeleccionado="detalleSeleccionado"
      :peajeSeleccionado="peajeSeleccionado"
      :verDetalle="verDetalle"
    /> -->
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import FiltrosBusqueda from '@/pantallas/Conecta/Clientes/FiltrosBusqueda.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { IFlota } from '@/interfaces/Flota';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoV2/AsociarFlotaEtiquetaVehiculo.vue';
import { IEtiqueta } from '@/interfaces/Etiquetas';
const { AgGridVue } = require('ag-grid-vue');
import { actionsEvent } from '@/setup';
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
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
  creadoPorColumnDefs,
  modificadoPorColumnDefs,
  fechaCreacionColumnDefs,
  fechaModificacionColumnDefs,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { LoadingService } from '@/services/loadingService';
import HandleErrors from '@/config/handleErrors'; //
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import moment from 'moment';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import {
  fetchHistorico,
  fetchTarifas,
  fetchVehiculos,
  fetchFlotas,
  fetchPeajes,
  fetchFlotasEnPeaje,
  fetchVehiculosEnPeaje,
  fetchAsignarVehiculos,
  MsResponseData,
} from '@/pantallas/Peajes/Asignacion/fetchData';
import VerDetalleModal from '@/pantallas/Peajes/Mantencion/VerDetalleModal.vue';
import AsociarVehiculo from '@/pantallas/Preventivas/AsociarVehiculo.vue';
import { boolean } from 'yup/lib/locale';

@Component({
  components: {
    MantenedorGridSinCodigo,
    FiltrosBusqueda,
    VerDetalleModal,
    AsociarFlotaEtiquetaVehiculo,
  },
})
export default class TarifasPantalla extends ComponenteBase {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.AsignarVehiculosPeajes;
  loadingService = new LoadingService();

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  detalleSeleccionado: any = null;
  peajeSeleccionado: number = 0;
  mostrarModalVerDetalle: boolean = false;
  infoItems: any[] = [];
  infoTypeReport: string = '';
  showInfoDialog: boolean = false;
  verDetalle: boolean = false;
  buscarPeaje: string = '';
  flotasAsignadas: IFlota[] = [];
  etiquetasAsignadas: IEtiqueta[] = [];

  vehiculos: any[] = [];
  gridApiVehiculo: GridApi = null;
  gridApiEtiqueta: GridApi = null;
  gridApiFlota: GridApi = null;
  vehiculosSeleccionados: any = [];
  etiquetasSeleccionados: any = [];
  flotasSeleccionados: any = [];
  radios: string = 'flotas';
  dataFVE: any = null;
  flotas: any[] = [];
  checkAllVehiculos: boolean = false;

  gridApi: GridApi = null;
  readonly gridOptionsVehiculo: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Unidad',
        field: 'unidad',
        lockVisible: true,
      },
      {
        headerName: 'Tipo de Vehículo',
        field: 'tipovehiculo',
      },
      {
        headerName: 'Marca',
        field: 'marca',
      },
      {
        headerName: 'Modelo',
        field: 'modelo',
      },
      {
        headerName: 'Tipo de Combustible',
        field: 'tipoCombustible',
      },
      {
        headerName: 'Tipo de Transmisión',
        field: 'tipoTransmision',
      },
      {
        headerName: 'Año',
        field: 'ano',
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyVehiculo,
    onSelectionChanged: this.selectionChangedVehiculos,
  };
  readonly gridOptionsFlotas: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyFlota,
    onSelectionChanged: this.selectionChangedFlotas,
  };
  readonly gridOptionsEtiquetas: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
    ].map(x => ({
      width: 200,
      hide: false,
      ...x,
    })),
    onGridReady: this.handleReadyEtiqueta,
    onSelectionChanged: this.selectionChangedEtiquetas,
  };
  readonly colDefVehiculo: Array<ColDef> = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      suppressMovable: true,
    },
    {
      headerName: 'Tipo de Vehículo',
      field: 'tipoVehiculo',
    },
    {
      headerName: 'Marca',
      field: 'marca',
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
    },
    {
      headerName: 'Tipo de Combustible',
      field: 'tipoCombustible',
    },
    {
      headerName: 'Tipo de Transmisión',
      field: 'tipoTransmision',
    },
    {
      headerName: 'Año',
      field: 'ano',
    },
  ];

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
  }
  formatFecha(fecha: moment.Moment) {
    return fecha.format('DD/MM/YYYY');
  }
  accionesTotales: PermisoAccion[] = [];

  mounted() {
    this.buscarFlotas();
  }

  selectAllVehiculo() {
    if (this.checkAllVehiculos === true) {
      this.vehiculos.forEach((x: any) => {
        const existe: boolean = this.vehiculosSeleccionados.some(
          (a: any) => a === x
        );
        if (existe === false) {
          this.vehiculosSeleccionados.push(x);
        }
      });
    } else {
      this.vehiculosSeleccionados = [];
    }
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 14) {
      retorno = item.substr(0, 200) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  async buscarVehiculos(flotas: any) {
    this.MsResponseData = (await this.fetchVehiculos(flotas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.vehiculos = this.MsResponseData.data;
          this.buscarVehiculosEnPeaje(this.vehiculos);
        } else {
          this.vehiculos = [];
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

  fetchVehiculos(flotas: any) {
    this.showLoading();
    return fetchVehiculos(flotas)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  async buscarFlotas() {
    this.MsResponseData = (await this.fetchFlotas()) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.flotas = this.MsResponseData.data;
          this.buscarFlotasEnPeaje(this.flotas);
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
  async buscarFlotasEnPeaje(flotas: any) {
    this.MsResponseData = (await this.fetchFlotasEnPeaje(flotas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.flotasSeleccionados = this.MsResponseData.data;
          this.buscarVehiculos(this.flotasSeleccionados);
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
  async AsignarVehiculos(flotas: any, vehiculos: any) {
    this.MsResponseData =
      (await this.fetchAsignarVehiculos(flotas, vehiculos)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success('Cambios Generados con Éxito.', {
            timeout: 3000,
          });
          this.buscarFlotas();
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
  async buscarVehiculosEnPeaje(flotas: any) {
    this.MsResponseData = (await this.fetchVehiculosEnPeaje(flotas)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.vehiculosSeleccionados = this.MsResponseData.data;
        } else {
          this.$snotify.error('Por Favor Seleccione algún Vehículo.', {
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

  fetchFlotasEnPeaje(flotas: any) {
    this.showLoading();
    return fetchFlotasEnPeaje(localStorage.clienteDefecto, flotas)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchVehiculosEnPeaje(vehiculos: any) {
    this.showLoading();
    return fetchVehiculosEnPeaje(localStorage.clienteDefecto, vehiculos)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchAsignarVehiculos(flotas: any, vehiculos: any) {
    this.showLoading();
    return fetchAsignarVehiculos(flotas, vehiculos)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  fetchFlotas() {
    this.showLoading();
    return fetchFlotas(localStorage.clienteDefecto)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  asignarVehiculos() {
    var sel = {
      flotas: this.flotasSeleccionados,
      vehiculos: this.vehiculosSeleccionados,
    };
    console.log(sel);
    this.AsignarVehiculos(sel.flotas, sel.vehiculos);
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
  async handleReadyVehiculo(event: GridReadyEvent) {
    this.gridApiVehiculo = event.api;
  }
  async handleReadyFlota(event: GridReadyEvent) {
    this.gridApiFlota = event.api;
  }
  async handleReadyEtiqueta(event: GridReadyEvent) {
    this.gridApiEtiqueta = event.api;
  }
  selectionChangedVehiculos() {
    this.vehiculosSeleccionados = this.gridApiVehiculo.getSelectedRows();
  }
  selectionChangedEtiquetas() {
    this.etiquetasSeleccionados = this.gridApiEtiqueta.getSelectedRows();
  }
  selectionChangedFlotas() {
    this.flotasSeleccionados = this.gridApiVehiculo.getSelectedRows();
  }

  // handleVehiculosChange(event: AsociarFlotaEtiquetaVehiculoChangeEvent) {
  //   if (event.flotas.length > 0) this.flotasAsignadas = event.flotas;

  //   if (event.etiquetas.length > 0) this.etiquetasAsignadas = event.etiquetas;

  //   this.vehiculos = event;
  // }
  limpiaGrillaVFE() {
    this.gridApiVehiculo.setRowData([]);
    this.gridApiFlota.setRowData([]);
    this.gridApiEtiqueta.setRowData([]);
  }

  clickRadio() {
    switch (this.radios) {
      case 'flotas':
        this.gridApiFlota.setRowData(this.dataFVE.flotas);
        break;
      case 'etiquetas':
        this.gridApiEtiqueta.setRowData(this.dataFVE.etiquetas);
        break;
      case 'vehiculos':
        this.gridApiVehiculo.setRowData(this.dataFVE.vehiculos);
        break;
    }
  }

  handleClickInfo(event: any) {
    var itemsInfo: any[] = [];
    if (event.value != '' && event.value != undefined && event.value != null) {
      for (var key in event.value) {
        if (event.value.hasOwnProperty(key)) {
          itemsInfo.push({ key: key, value: event.value[key].appname });
        }
      }
    }
    if (itemsInfo.length == 0) {
      itemsInfo.push({ key: 1, value: 'Sin Aplicaciones' });
    }
    this.infoItems = itemsInfo;
    this.infoTypeReport = event.data.nombre_reporte;
    this.showInfoDialog = true;
  }

  onFilterPeajes() {
    if (this.buscarPeaje.length > 1) {
      this.gridApi.setQuickFilter(this.buscarPeaje);
    } else {
      this.gridApi.setQuickFilter('');
    }
  }

  preventEnter(event: any) {
    if (event.key == 'Enter') {
      event.preventDefault();
    }
  }

  filtroForm(filtros: any) {}

  handleVerDetalleClick(params: ICellRendererParams) {
    this.verDetalle = true;
    this.detalleSeleccionado = params.data;
    this.detalleSeleccionado = this.detalleSeleccionado.id_ruta;
    this.mostrarModalVerDetalle = true;
  }

  handleEditarClick(params: ICellRendererParams) {
    this.verDetalle = false;
    this.detalleSeleccionado = params.data;
    this.detalleSeleccionado = this.detalleSeleccionado.id_ruta;
    this.mostrarModalVerDetalle = true;
  }

  async buscarTarifas(id: number) {
    this.MsResponseData = (await this.fetchTarifas(id)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.detalleSeleccionado = this.MsResponseData.data;
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

  fetchTarifas(id_peaje: number) {
    this.showLoading();
    return fetchTarifas(id_peaje)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las facturaciones',
          })
        );
        return;
      })
      .finally(() => this.hideLoading());
  }

  constructor() {
    super();
    actionsEvent.onEditar(this.handleEditarClick);
    actionsEvent.onVerDetalle(this.handleVerDetalleClick);
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
}
</script>
<style scoped>
::v-deep .gridcard div.parent .v-card {
  display: none !important;
}

::v-deep .ag-root-wrapper-body.ag-layout-normal {
  height: auto !important;
}
</style>
