<template>
  <div>
    <v-tabs centered icons-and-text style="padding-left: 65px">
      <v-tabs-slider style="display: none"></v-tabs-slider>

      <v-divider class="mx-12" style="padding=0px;" inset vertical></v-divider>

      <span style="padding-top: 38px;padding-left:10px;">Fundos</span>

      <v-autocomplete
        v-show="showSelect"
        :style="estilosIndicadores"
        @input="emitirTextoBusqueda"
        :items="sitios"
        item-text="nombre"
        item-value="id"
        flat
        no-data-text="Sin resultados"
        @change="changeSelected"
      />

      <v-divider
        style="padding-left: 10px"
        class="mx-12"
        inset
        vertical
      ></v-divider>
      <v-container
        style="padding-top: 10px !important"
        v-show="indicadores.visible"
      >
        <v-layout>
          <v-flex xs2 md2 lg2>
            <span style="font-size: 20px; padding-left: 50px">
              {{ vehiculosEnTotal }}
            </span>
            <br />
            <span style="padding-left: 1px" class="labelTabs"
              >VEHÍCULOS EN TOTAL</span
            >
          </v-flex>
          <v-flex xs3 md3 lg3>
            <span style="font-size: 20px; padding-left: 75px">
              {{ vehiculosTransmitiendo }}
            </span>
            <br />
            <span style="padding-left: 29px" class="labelTabs"
              >VEHÍCULOS EN LÍNEA</span
            >
          </v-flex>
          <v-flex xs3 md3 lg3>
            <span style="font-size: 20px; padding-left: 60px">
              {{ vehiculosSinTransmitir }}
            </span>
            <br />
            <span style="whidth=10px " class="labelTabs"
              >VEHÍCULOS FUERA DE LÍNEA</span
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-tabs>

    <app-confirmacion
      :show="modalSearchVehiculo"
      :titulo="tituloSearchVehiculo"
      :mensaje="mensajeSearchVehiculo"
      v-on:modalConfirmationEmit="searchVehiculoCallback($event)"
      :textoBtnSi="$t('mensajes.crud.cambioCliente.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.cambioCliente.btnCancelar')"
      :width="390"
    ></app-confirmacion>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { filtroHomeEventBus, filtroHomeEvents } from '@/setup';
import config from '@/config/index';
import { HomeFiltros } from '@/config/enums';
import { Component } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { IFlota } from '@/interfaces/Flota';
import { IEtiqueta } from '@/interfaces/Etiquetas';
import { IVehiculo } from '@/interfaces/Vehiculos';
import store from '@/store';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { LoadingService } from '@/services/loadingService';
import ActividadesEventBus from '@/eventBus/actividadesEventBus';
import { eventBus } from '@/setup';
import Confirmation from '@/components/Confirmation.vue';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { number } from 'node_modules/@types/yup';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class HomeTabsSugal extends ComponenteBase {
  // funcionalidades y permisos
  readonly funcionalidad: Funcionalidades = Funcionalidades.Inicio;

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  indicadores: PermisoAccion = {
    accionCodigo: 8,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [this.accionConsultar, this.indicadores];

  //
  controllerFlota: string = 'flota';
  controllerEtiqueta: string = 'VehiculoEtiqueta';
  controllerVehiculo: string = 'Vehiculo';
  axios: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  elementosSelect: any = [];
  elementosSeleccionados: number[] = [];
  nroElementosFocus: number;
  checkAll: boolean = false;

  $snotify: any;
  dialog: boolean = true;
  active: any = null;
  tabs: any = [];
  permisosIndicadores: boolean = false;
  items: any = [];
  estilosIndicadores: string = '';
  model: any = null;
  sitios: any = null;
  isLoading: boolean = false;
  search: string = '';
  vehiculosTransmitiendo: number = 0;
  vehiculosSinTransmitir: number = 0;
  vehiculosEnTotal: number = 0;
  usuario: any = this.$store.state.user;
  usuarioId: number = store.state.userId;
  loadingService = new LoadingService();
  showSelect: boolean = true;
  searchVehiculo: string = '';
  vehiculoSeleccionado: IVehiculo = null;
  primerInicio: boolean = false;
  modalSearchVehiculo: boolean = false;
  tituloSearchVehiculo: any = '';
  mensajeSearchVehiculo: any = '';
  itemVeh: any = null;

  constructor() {
    super();
  }

  created() {
    this.tabs = [
      { id: 1, nombre: 'Registro Actividades' },
      { id: 2, nombre: 'Mantenciones' },
      { id: 3, nombre: 'Alertas' },
    ];

    let filtros = [];
    for (let item in HomeFiltros) {
      if (!isNaN(Number(item))) {
        let estado = HomeFiltros[item];
        filtros.push({
          id: Number(item),
          nombre: estado,
        });
      }
    }

    this.items = filtros;
    this.model = filtroHomeEventBus.filtro;

    store.subscribe((mutation, state) => {
      if (mutation.type === 'setCantidadVehiculosHome') {
        if (mutation.payload !== undefined) {
          this.vehiculosTransmitiendo =
            mutation.payload.transmitiendo !== undefined
              ? mutation.payload.transmitiendo
              : 0;
          this.vehiculosSinTransmitir =
            mutation.payload.sintransmitir !== undefined
              ? mutation.payload.sintransmitir
              : 0;
          this.vehiculosEnTotal =
            this.vehiculosTransmitiendo + this.vehiculosSinTransmitir;
        }
      }
    });
    this.primerInicio = filtroHomeEventBus.primerInicio;
    this.obtenerFiltro();
  }

  mounted() {
    // Escucha si hay cambios en los permisos al cambiar cliente
    store.subscribe((mutation, state) => {
      if (mutation.type === 'setPermisoIndicadores') {
        this.indicadores.visible = store.getters.getPermisoIndicadores;
      }
      // mantiene estilo al desaparecer indicadores
      if (this.indicadores.visible) {
        this.estilosIndicadores =
          'max-width:870px; padding-top:15px; width:870px; !important; padding-left:15px;';
      } else {
        this.estilosIndicadores =
          'max-width:500px; padding-top:15px; width:500px; !important; padding-left:15px;';
      }
    });

    filtroHomeEventBus.$on(
      'establecerFiltroNav',
      (
        filtro: HomeFiltros,
        elementosSeleccionados: number[],
        unidadSeleccionada: string
      ) => {
        this.model = filtro;
        this.elementosSeleccionados = elementosSeleccionados;
        this.searchVehiculo = unidadSeleccionada;
        this.obtenerFiltro();
      }
    );
    filtroHomeEventBus.$on('sitiosSugal', (sitios: any) => {
      this.handleSitiosSugal(sitios);
    });
  }
  handleSitiosSugal(params: any) {
    this.sitios = params;
  }

  focus(evento: boolean) {
    if (evento === true) {
      this.nroElementosFocus = this.elementosSeleccionados.length;
    } else if (
      evento === false &&
      this.nroElementosFocus != this.elementosSeleccionados.length
    ) {
      this.changeFiltro(0, false);
    }
  }

  selectAll() {
    if (this.checkAll === true) {
      this.elementosSelect.forEach((x: any) => {
        const existe: boolean = this.elementosSeleccionados.some(
          a => a === x.id
        );
        if (existe === false) {
          this.elementosSeleccionados.push(x.id);
        }
      });
    } else {
      this.elementosSeleccionados = [];
    }
  }

  changeSelected(params: any) {
    let sitio = this.sitios.filter((x: any) => x.id == params);

    var formaJson = sitio[0].formaJson;

    filtroHomeEventBus.$emit('changeFundoCenter', formaJson);
  }

  validaFiltros() {
    for (
      let i: number = filtroHomeEventBus.elementosSeleccionados.length - 1;
      i >= 0;
      i--
    ) {
      const existe: any = this.elementosSelect.find(
        (x: any) => x.id == filtroHomeEventBus.elementosSeleccionados[i]
      );
      if (existe === undefined) {
        filtroHomeEventBus.elementosSeleccionados.splice(i, 1);
      }
    }
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 41) {
      retorno = item.substr(0, 40) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  async obtenerFiltro() {
    this.primerInicio = filtroHomeEventBus.primerInicio;
    this.showSelectFiltros();
    if (this.model === HomeFiltros.Flota) {
      this.obtenerFlotas().then(() => {
        this.validaFiltros();
        this.searchVehiculo = '';

        this.elementosSeleccionados = filtroHomeEventBus.elementosSeleccionados;
        filtroHomeEventBus.$emit('renderHomeGrid', true);
        filtroHomeEventBus.$emit(filtroHomeEvents.cambiarFiltro);

        if (
          filtroHomeEventBus.elementosSeleccionados.length ===
          this.elementosSelect.length
        )
          this.checkAll = true;
        else this.checkAll = false;
      });
    } else if (this.model === HomeFiltros.Etiqueta) {
      this.obtenerEtiquetas().then(() => {
        this.validaFiltros();
        this.searchVehiculo = '';

        this.elementosSeleccionados = filtroHomeEventBus.elementosSeleccionados;
        filtroHomeEventBus.$emit('renderHomeGrid', true);
        filtroHomeEventBus.$emit(filtroHomeEvents.cambiarFiltro);
      });
    } else if (this.model === HomeFiltros.Vehículo) {
      this.searchVehiculo = filtroHomeEventBus.unidadSeleccionada;
      filtroHomeEventBus.$emit('renderHomeGrid', true);
      filtroHomeEventBus.$emit(filtroHomeEvents.cambiarFiltro);
    }
  }

  async changeFiltro(filtro: HomeFiltros, aux: boolean = false) {
    store.commit('setGenerandoRuta', false);
    store.commit('setLimpiarMapa', true);

    this.$store.commit('setFiltroHome', filtro);
    filtroHomeEventBus.$emit('parametrosNavHome', this.search, this.model);

    filtroHomeEventBus.filtro = this.model;

    if (this.model !== HomeFiltros.Vehículo) {
      filtroHomeEventBus.elementosSeleccionados = this.elementosSeleccionados;
      filtroHomeEventBus.unidadSeleccionada = '';
      this.searchVehiculo = '';
      filtroHomeEventBus.$emit('guardarEstadoHome');
    } else {
      //Guardo Estado UI para Cliente actual
      const clienteId = config.getClienteSesion();
      filtroHomeEventBus.filtro = this.model;
      filtroHomeEventBus.elementosSeleccionados = [];
      filtroHomeEventBus.unidadSeleccionada = this.searchVehiculo;
      filtroHomeEventBus.$emit('clienteCambio', clienteId); //Aca guarda EstadoUI
      //---
      if (this.searchVehiculo.length > 0)
        await this.obtenerClienteDuenioVehiculo(this.searchVehiculo);
    }

    if (!aux) this.obtenerFiltro();

    ActividadesEventBus.$emit('actividadesEventBus', { vehiculo: null });
  }

  emitirTextoBusqueda(): void {
    filtroHomeEventBus.$emit('parametrosNavHome', this.search, this.model);
  }

  obtenerFlotas(): Promise<void> {
    const clienteId = config.getClienteSesion();

    return (
      this.axios.http
        //.get<IFlota[]>(`${this.controllerFlota}/${this.usuarioId}/usuarioflota/`)
        .get<IFlota[]>(
          `${this.controllerFlota}/${this.usuarioId}/${clienteId}/usuarioflotacliente/`
        )
        .then(response => {
          if (response.data.length > 0) {
            /*this.elementosSelect = response.data.filter(
            (x: any) => x.clienteId === clienteId
          );*/
            this.elementosSelect = response.data;
            if (this.primerInicio) {
              this.elementosSelect.forEach((x: any) => {
                this.elementosSeleccionados.push(x.id);
                this.changeFiltro(this.model, true);
                filtroHomeEventBus.primerInicio = false;
              });
            }
            // regla de negocio, usuario admintrack no debe mostrar flotas seleccionadas o cargadas
            if (this.usuario.email === 'admintrack@gpschile.com') {
              this.elementosSeleccionados = [];
              this.elementosSelect = [];
              this.searchVehiculo = '';
            }
          }
        })
        .catch(error => {})
    );
  }

  obtenerEtiquetas() {
    const clienteId = config.getClienteSesion();

    return this.axios.http
      .get<IEtiqueta[]>(`${this.controllerEtiqueta}/${clienteId}/cliente`)
      .then(response => {
        this.elementosSelect = response.data;
        // regla de negocio, usuario admintrack no debe mostrar etiquetas seleccionadas o cargadas
        if (this.usuario.email === 'admintrack@gpschile.com') {
          this.elementosSeleccionados = [];
          this.elementosSelect = [];
          this.searchVehiculo = '';
        }
      })
      .catch(error => {});
  }

  async obtenerClienteDuenioVehiculo(unidad: string) {
    this.loadingService.showLoading(); //[Entrega3 - B501] Home - Filtro de Vehículo
    return await this.axios.http
      .get(`${this.controllerVehiculo}/${unidad}/getClienteDuenioVehiculo`)
      .then(response => {
        this.loadingService.hideLoading(); //[Entrega3 - B501] Home - Filtro de Vehículo
        if (response.data !== null && response.data !== undefined) {
          this.modalSearchVehiculo = false;
          const veh = response.data[0];
          this.itemVeh = veh;
          const clienteId = config.getClienteSesion();
          if (clienteId !== veh.clienteId) {
            this.modalSearchVehiculo = true;
            this.tituloSearchVehiculo = this.$t(
              'mensajes.crud.cambioCliente.titulo',
              { unidad: this.itemVeh.unidad }
            );
            this.mensajeSearchVehiculo = this.$t(
              'mensajes.crud.cambioCliente.mensaje',
              {
                unidad: this.itemVeh.unidad,
                cliente: this.itemVeh.clienteNombre,
              }
            );
          }
        }

        // regla de negocio, usuario admintrack no debe mostrar etiquetas seleccionadas o cargadas
        if (this.usuario.email === 'admintrack@gpschile.com') {
          this.elementosSeleccionados = [];
          this.elementosSelect = [];
          this.searchVehiculo = '';
        }
      })
      .catch(error => {
        this.loadingService.hideLoading(); //[Entrega3 - B501] Home - Filtro de Vehículo
      });
  }

  showSelectFiltros() {
    if (this.model === HomeFiltros.Vehículo) this.showSelect = false;
    else this.showSelect = true;
  }

  async searchVehiculoCallback(val: boolean) {
    this.modalSearchVehiculo = false;
    if (val) {
      //Guardo Estado UI para nuevo Cliente
      filtroHomeEventBus.filtro = this.model;
      filtroHomeEventBus.elementosSeleccionados = [];
      filtroHomeEventBus.unidadSeleccionada = this.itemVeh.unidad;
      filtroHomeEventBus.$emit('clienteCambio', this.itemVeh.clienteId);
      //---
      eventBus.changeClienteBuscadorVehiculo(this.itemVeh.clienteId);
    }
  }
}
</script>

<style scoped>
.labelTabs {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.77) !important;
  align-content: center;
  text-align: center;
}
</style>
