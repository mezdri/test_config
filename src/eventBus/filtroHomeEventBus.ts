import Vue from 'vue';
import store from '@/store';
import config from '@/config/index';
import { HomeFiltros } from '@/config/enums';
import { Emit, Component } from 'vue-property-decorator';
import { EstadoUiUtil } from '@/estadoUiUtil/EstadoUiUtil';
import { EstadoHomeUi } from '@/estadoUiUtil/EstadoUiVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { LoadingService } from '@/services/loadingService';

@Component
export class FiltroHomeEventBus extends Vue {
  coordenadas: google.maps.LatLng;
  zoom: number;
  textoBuscarVehiculo: string;
  textoBuscarNav: string;
  filtro: HomeFiltros;
  estadoUiUtil: EstadoUiUtil = new EstadoUiUtil();
  elementosSeleccionados: number[] = [];
  tipoMapa: any = 'roadmap'; //Tipo Mapa
  usuarioId: number = store.state.userId;
  clienteId: number = config.getClienteSesion();
  readonly componente: string = 'Inicio';
  loadingService = new LoadingService();
  primerInicio: boolean = false;
  unidadSeleccionada: string; //Filtro Vehiculo Home
  groupZones: any[] = [];

  constructor() {
    super();
  }

  @Emit('filtroHome')
  filtroHome(filtro: number = 0, elementosSeleccionados: number[] = []): void {
    this.filtro = filtro;
    this.elementosSeleccionados = elementosSeleccionados;
  }

  mounted(): void {
    this.estadoUiUtil.estadoUiVm.usuarioId = store.state.userId;
    this.estadoUiUtil.estadoUiVm.componente = this.componente;
    this.estadoUiUtil.estadoUiVm.funcionalidades = Funcionalidades.Inicio;
    this.estadoUiUtil.estadoUiVm.clienteId = config.getClienteSesion();
  }

  created(): void {
    this.$on(
      'posicionGoogleMaps',
      (coordenadas: google.maps.LatLng, zoom: number) => {
        this.coordenadas = coordenadas;
        this.zoom = zoom;

        this.$emit('guardarEstadoHome');
      }
    );

    this.$on(
      'parametrosNavHome',
      (textoBuscarNav: string, filtro: HomeFiltros) => {
        this.textoBuscarNav = textoBuscarNav;
        this.filtro = filtro;
      }
    );

    this.$on('textoBuscarVehiculo', (textoBuscarVehiculo: string) => {
      this.textoBuscarVehiculo = textoBuscarVehiculo;
    });

    this.$on('guardarGrupoZonas', (zoneGroup: any[]) => {
      this.groupZones = zoneGroup;
    });

    this.$on('guardarEstadoHomeCenter', (center: google.maps.LatLng) => {
      this.coordenadas = center;
    });

    this.$on('guardarTipoMapa', (mapaType: string) => {
      this.tipoMapa = mapaType;
    });

    this.$on('getZones', () => {
      var UiStates: any = this.estadoUiUtil.estadoUiVm.objeto;
      this.$emit(
        'setGroupZones',
        UiStates.hasOwnProperty('grupoZonas') ? UiStates.grupoZonas : []
      );
    });

    this.$on('guardarEstadoHomeZoom', (zoom: any) => {
      this.zoom = zoom;
    });

    this.$on('clienteCambio', (clienteId: number) => {
      this.clienteId = clienteId;
      this.$emit('guardarEstadoHome');
    });

    this.$on('guardarEstadoHome', () => {
      this.guardarEstadoHomeUi();
    });

    this.$on('restaurarEstadoHome', () => {
      this.restaurarEstadoHomeUi();
    });

    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadHomeGridDetalle') {
        if (mutation.payload !== undefined) {
          if (store.getters.isLoadedHome) {
            this.loadingService.hideLoading();
          } else {
            //this.loadingService.showLoading();
          }
        }
      }
    });
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setStateLoadHomeGrid') {
        if (mutation.payload !== undefined) {
          if (store.getters.isLoadedHome) {
            this.loadingService.hideLoading();
          } else {
            this.loadingService.showLoading();
          }
        }
      }
    });
  }

  guardarEstadoHomeUi(): Promise<any> {
    const estado: EstadoHomeUi = {
      coordenadas: {
        lat: this.coordenadas != undefined ? this.coordenadas.lat() : -33.4372,
        lng: this.coordenadas != undefined ? this.coordenadas.lng() : -70.6506,
      },
      zoom: this.zoom,
      filtro: this.filtro,
      elementosSeleccionados: this.elementosSeleccionados,
      tipoMapa: this.tipoMapa != undefined ? this.tipoMapa : 'roadmap',
      unidadSeleccionada: this.unidadSeleccionada,
      grupoZonas: this.groupZones,
    };
    this.estadoUiUtil.estadoUiVm.usuarioId = store.state.userId;
    this.estadoUiUtil.estadoUiVm.componente = this.componente;
    this.estadoUiUtil.estadoUiVm.funcionalidades = Funcionalidades.Inicio;
    this.estadoUiUtil.estadoUiVm.clienteId =
      this.clienteId === 0 ? config.getClienteSesion() : this.clienteId; //config.getClienteSesion();

    this.estadoUiUtil.estadoUiVm.objeto = JSON.stringify(estado);

    return this.estadoUiUtil.guardarEstado();
  }

  restaurarEstadoHomeUi(): void {
    this.estadoUiUtil.estadoUiVm.usuarioId = store.state.userId;
    this.estadoUiUtil.estadoUiVm.componente = this.componente;
    this.estadoUiUtil.estadoUiVm.funcionalidades = Funcionalidades.Inicio;
    this.estadoUiUtil.estadoUiVm.clienteId = config.getClienteSesion();

    this.estadoUiUtil.recuperarEstado().then(() => {
      localStorage.setItem(
        'clienteDefecto',
        this.estadoUiUtil.estadoUiVm.clienteId.toString()
      );
      store.commit('setCliente', this.estadoUiUtil.estadoUiVm.clienteId);
      this.coordenadas = new google.maps.LatLng(
        this.estadoUiUtil.estadoUiVm.objeto.coordenadas.lat,
        this.estadoUiUtil.estadoUiVm.objeto.coordenadas.lng
      );
      this.zoom = this.estadoUiUtil.estadoUiVm.objeto.zoom;
      this.filtro =
        this.estadoUiUtil.estadoUiVm.objeto.filtro === undefined
          ? 0
          : this.estadoUiUtil.estadoUiVm.objeto.filtro;
      this.elementosSeleccionados = this.estadoUiUtil.estadoUiVm.objeto.elementosSeleccionados;
      this.tipoMapa = this.estadoUiUtil.estadoUiVm.objeto.tipoMapa; //Tipo Mapa en el estadoUi del Home
      this.primerInicio = this.estadoUiUtil.estadoUiVm.objeto.primerInicio;
      if (this.primerInicio == undefined) {
        this.primerInicio = false;
      }
      this.unidadSeleccionada =
        this.estadoUiUtil.estadoUiVm.objeto.unidadSeleccionada === undefined
          ? ''
          : this.estadoUiUtil.estadoUiVm.objeto.unidadSeleccionada; //Filtro Vehiculo Home
      this.$emit(
        'establecerFiltroNav',
        this.filtro,
        this.elementosSeleccionados,
        this.unidadSeleccionada //Filtro Vehiculo Home
      );
      this.$emit('recargarTipoLugarCliente', config.getClienteSesion());
      this.$emit('renderedHomeTabs', true);
      this.$emit('setTipoMapa', this.tipoMapa); //Setea Tipo Mapa al crearlo en el Home
      //this.$emit('centrarMapaEstadoInicio', this.coordenadas, this.zoom); //Setea Zoom y Coordenadas en el Home
      // this.$emit('primerInicio', this.primerInicio);
    });
  }
}
