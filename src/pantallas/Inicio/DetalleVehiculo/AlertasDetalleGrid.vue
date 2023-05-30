<template>
  <div>
    <MantenedorGrid :grid-options="gridOptions" />
    <VerAlertaVehiculoModal
      v-if="mostrarModalVerDetalle"
      :lstAlertasBase="lstAlertasBase"
      :alertaVehiculo="alertaVehiculo"
      :alertaConfig="alertaConfig"
      @cerrar="handleCierreModal()"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import store from '@/store';
import moment from 'moment';
import config from '@/config/index';
import { Component, Prop, Watch } from 'vue-property-decorator';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import vehiculoEventBus from '@/pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';
import {
  fecthAlertasRepetirDia,
  fetchAlertasVehiculo,
} from '@/pantallas/Inicio/AlertasData/fetchAlertasVehiculo';
import { fetchAlertasBase } from '@/pantallas/Alertas/Services/fetchAlertasBase';
import { fetchByIdAlerta } from '@/pantallas/Alertas/Services/fetchByIdAlerta';
import { fetchByIdAlertaVehiculo } from '@/pantallas/Inicio/AlertasData/fetchByIdAlertaVehiculo';
import { AlertaVehiculo, AlertaBackend } from '../../../interfaces/Alertas';
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import VerAlertaVehiculoModal from '@/pantallas/Alertas/VerAlertaVehiculoModal.vue';

import repetirDiaAlertaEventBus from '@/pantallas/Inicio/RepetirDiaData/RepetirDiaAlertaEventBus';
import { RepetirDiaRequest } from '../RepetirDiaData/fetchRepetirDia';

@Component({
  components: {
    MantenedorGrid,
    VerAlertaVehiculoModal,
  },
})
export default class AlertasDetalleGrid extends Vue {
  vehiculo: Vehiculo;

  $snotify: any;
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;

  //Alertas
  columnDefsAlertas: any = [];
  lstAlertasVehiculo: AlertaVehiculo[] = [];
  alertaVehiculo: AlertaVehiculo = {};
  alertaConfig: AlertaBackend = {};
  lstAlertasBase: AlertasBaseBackend[] = [];
  mostrarModalVerDetalle: boolean = false;

  /* aggrid */

  gridApi: GridApi;

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Color de Tipificación de Alerta',
        field: 'color',
        rowDrag: true,
        enablePivot: true,
      },
      {
        headerName: 'Fecha de Generación',
        field: 'fechaCreacion',
        rowDrag: true,
        enablePivot: true,
        comparator: this.customComparator,
        cellRenderer: (params: any) => {
          if (params.data != null && params.data.fechaCreacion != null) {
            const newFecha = new Date(params.data.fechaCreacion);
            return moment(String(newFecha)).format('DD/MM/YYYY HH:mm:ss');
          } else {
            return '';
          }
        },
      },
      {
        headerName: 'Tipo de Alerta',
        field: 'tipoAlerta',
        rowDrag: true,
        enablePivot: true,
      },
      {
        headerName: 'Nombre de la Alerta',
        field: 'nombre',
        rowDrag: true,
        enablePivot: true,
      },
      {
        headerName: 'Mensaje de la Alerta',
        field: 'mensaje',
        rowDrag: true,
        enablePivot: true,
      },
      {
        headerName: 'Ver Detalle',
        field: 'alertaConfigId',
        rowDrag: true,
        enablePivot: true,
        cellRenderer: this.createVerDetalle,
      },
      {
        headerName: 'Mapa',
        field: 'mapa',
        suppressMovable: true,
        enablePivot: true,
        lockVisible: true,
        pinned: 'right',
        cellRenderer: this.createMapaBtn,
      },
    ],
    onGridReady: this.handleGridReady,
  };

  handleAlertaRepetirDia(repetirAlertaDia: RepetirDiaRequest) {
    if (repetirAlertaDia.fechaInicio == null) {
      this.fetchAlertasByVehiculo();
    } else {
      this.fetchAlertasByVehiculoRepetirDia(repetirAlertaDia);
    }
  }

  mounted() {
    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalleVehiculo);
    this.fetchAlertasBase();
    repetirDiaAlertaEventBus.oncargarAlertasRepetirDia(
      this.handleAlertaRepetirDia
    );
    //RepetirDiaEventBus.onCargarActividadesRepetirDia(this.handleLogPrueba);
  }

  customComparator(valueA: moment.Moment, valueB: moment.Moment) {
    return valueA.diff(valueB);
  }

  handleGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  handleAbrirDetalleVehiculo(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    this.vehiculo = vehiculo;
    this.fetchAlertasByVehiculo();
  }

  /* Fetchs */

  async fetchAlertasByVehiculoRepetirDia(repetirAlertaDia: RepetirDiaRequest) {
    this.gridApi.showLoadingOverlay();
    fecthAlertasRepetirDia(repetirAlertaDia)
      .then(a => {
        this.lstAlertasVehiculo = a;
        this.gridApi.redrawRows();
        this.gridApi.setRowData(this.lstAlertasVehiculo);
      })
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Alertas',
          })
        );
        return;
      });
  }

  async fetchAlertasByVehiculo() {
    this.gridApi.showLoadingOverlay();
    fetchAlertasVehiculo(this.vehiculo.id)
      .then(a => {
        this.lstAlertasVehiculo = a;
        this.gridApi.redrawRows();
        this.gridApi.setRowData(this.lstAlertasVehiculo);
      })
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'las Alertas',
          })
        );
        return;
      });
  }

  async fetchAlertasBase() {
    return fetchAlertasBase()
      .then(res => {
        this.lstAlertasBase = res;
      })
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener los tipos de alerta',
          { timeout: 3000 }
        )
      );
  }

  async fetchByIdAlertaConfig(id: number) {
    return fetchByIdAlerta(id)
      .then(e => {
        return e;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la configuración de la Alerta',
          { timeout: 3000 }
        );

        return null;
      });
  }

  async fetchByIdAlertaVehiculo(alertaId: number, alertaBaseId: number) {
    return fetchByIdAlertaVehiculo(alertaId)
      .then(e => {
        e.alertaBaseId = alertaBaseId;
        return e;
      })
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener la Alerta',
          { timeout: 3000 }
        );

        return null;
      });
  }

  /** Util Grid **/

  createVerDetalle(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'VER DETALLE';
    eSpan.id = params.data.alertaId;
    eSpan.style.cssText = 'cursor:pointer;color:#000000;font-size: 13px;';
    eSpan.title = 'Ver Detalle';

    eSpan.addEventListener('click', () => {
      this.handleMostrarDetalle(
        params.data.alertaId,
        params.data.alertaConfigId,
        params.data.latitudInicioExceso,
        params.data.longitudInicioExceso
      );
    });

    return eSpan;
  }

  async handleMostrarDetalle(
    alertaId: number,
    alertaConfigId: number,
    latitud: number,
    longitud: number
  ) {
    this.alertaConfig = await this.fetchByIdAlertaConfig(alertaConfigId);
    this.alertaVehiculo = await this.fetchByIdAlertaVehiculo(
      alertaId,
      this.alertaConfig.alertaBaseId
    );
    this.alertaVehiculo.latitudInicioExceso = latitud;
    this.alertaVehiculo.longitudInicioExceso = longitud;

    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.mostrarModalVerDetalle = true;
  }

  handleCierreModal() {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.mostrarModalVerDetalle = false;
  }

  createMapaBtn(params: any) {
    var eSpan = document.createElement('i');
    eSpan.innerHTML = 'map';
    eSpan.className = 'material-icons';
    eSpan.id = params.data.id;
    eSpan.style.cssText = 'cursor:pointer;color:#27488E;font-size: 25px;';
    eSpan.title = 'Ver Mapa';

    eSpan.addEventListener('click', () => {
      var latitud = params.data.latitudInicioExceso;
      var longitud = params.data.longitudInicioExceso;
      this.openDetalle(latitud, longitud);
    });
    return eSpan;
  }

  openDetalle(latitud: string, longitud: string) {
    var link =
      'https://www.google.com/maps/search/?api=1&query=' +
      latitud +
      ',' +
      longitud;
    window.open(link, '_blank');
  }
}
</script>
