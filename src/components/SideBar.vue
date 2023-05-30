import { ClientFilterI } from '@/interfaces/Filters'; import { MSResponse } from
'@/interfaces/MS';
<template>
  <div>
    <div v-if="!detalleVehiculoHomeRendered" id="drawerDivSetup">
      <div v-if="drawer">
        <v-navigation-drawer
          :mini-variant="miniVariant"
          :clipped="clipped"
          v-model="drawer"
          :width="327"
          app
        >
          <v-divider></v-divider>
          <v-list>
            <v-list v-show="false">
              <v-list-tile>
                <v-list-tile-title style="cursor: pointer; font-size: 13px">
                  Home
                </v-list-tile-title>
                <v-list-tile-action>
                  <v-icon>home</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-list-group
              v-for="item in aplicaciones"
              v-show="item.visible"
              v-model="item.active"
              :key="item.title"
              no-action
              :value="true"
            >
              <template>
                <v-list-tile avatar slot="activator">
                  <v-list-tile-title style="cursor: pointer; font-size: 13px">
                    {{ item.title }}
                  </v-list-tile-title>
                  <v-list-tile-action>
                    <v-icon>{{ item.action }}</v-icon>
                  </v-list-tile-action>
                </v-list-tile>
              </template>
              <div v-if="tieneHijos(item.items)">
                <v-list-group
                  v-for="subItem in item.items"
                  right
                  v-show="subItem.visible"
                  :key="subItem.title"
                  sub-group
                  no-action
                >
                  <template>
                    <v-list-tile slot="activator">
                      <v-list-tile-title
                        style="cursor: pointer; font-size: 13px"
                      >
                        {{ subItem.title }}
                      </v-list-tile-title>
                      <v-list-tile-action>
                        <v-icon>{{ subItem.action }}</v-icon>
                      </v-list-tile-action>
                    </v-list-tile>
                  </template>

                  <v-list-tile
                    v-for="subItem2 in subItem.items"
                    :key="subItem2.title"
                    v-show="subItem2.visible"
                  >
                    <v-list-tile-content>
                      <v-list-tile-title
                        @click="selectComponent(subItem2.path)"
                      >
                        <router-link
                          v-if="subItem2.path.startsWith('/')"
                          tag="li"
                          active-class="router-link-active"
                          style="cursor: pointer; font-size: 13px"
                          :to="subItem2.path"
                          >{{ subItem2.title }}</router-link
                        >
                        <a
                          v-else
                          :href="subItem2.path"
                          target="_blank"
                          class="vinculo-externo"
                          >{{ subItem2.title }}</a
                        >
                      </v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <v-icon>{{ subItem2.action }}</v-icon>
                    </v-list-tile-action>
                  </v-list-tile>
                </v-list-group>
              </div>
              <div v-else v-for="subItem in item.items" :key="subItem.title">
                <v-list-tile
                  v-for="subItem2 in subItem.items"
                  :key="subItem2.title"
                  v-show="subItem2.visible"
                >
                  <v-list-tile-content>
                    <v-list-tile-title @click="selectComponent(subItem2.path)">
                      <router-link
                        v-if="subItem2.path.startsWith('/')"
                        tag="li"
                        active-class="router-link-active"
                        style="cursor: pointer; font-size: 13px"
                        :to="subItem2.path"
                        >{{ subItem2.title }}</router-link
                      >
                      <a
                        v-else
                        :href="subItem2.path"
                        target="_blank"
                        class="vinculo-externo"
                        >{{ subItem2.title }}</a
                      >
                    </v-list-tile-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-icon>{{ subItem2.action }}</v-icon>
                  </v-list-tile-action>
                </v-list-tile>
              </div>
            </v-list-group>
          </v-list>
        </v-navigation-drawer>
      </div>
      <div v-else>
        <v-navigation-drawer
          v-show="drawer == false"
          :clipped="clipped"
          v-model="drawerfloat"
          style="background:transparent"
          app
          v-bind:width="55"
          max-width="40"
          min-width="40"
        >
          <v-toolbar style="background:transparent" flat>
            <template>
              <v-list style="background-color: transparent;">
                <v-list-tile
                  v-for="item in aplicaciones"
                  :key="item.title"
                  v-show="item.visible"
                >
                  <v-list-tile-action style="background-color: transparent;">
                    <v-btn
                      outline
                      style="background-color: transparent; border:none;  !important; margin-left:-38px"
                      @click="(drawer = true), (drawerfloat = false)"
                    >
                      <v-icon color="#606060">{{ item.action }}</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </template>
          </v-toolbar>
        </v-navigation-drawer>
      </div>

      <v-toolbar class="color-header-bar" dark app :clipped-left="clipped">
        <v-toolbar-side-icon
          v-show="showSideBar"
          @click.stop="(drawer = !drawer), (drawerfloat = !drawerfloat)"
        ></v-toolbar-side-icon
        >&nbsp;&nbsp;
        <!--        <img
          @click="goToHome()"
          src="../assets/LOGO-GPSCHILE-BLANCO-20180306.png"
          alt="GPS Chile"
          style="max-width: 80px; cursor: pointer"
          title="Ir al Inicio"
        />-->
        <div
          class="logo-sidebar"
          @click="goToHome()"
          title="Ir al Inicio"
        ></div>

        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <v-flex xs6 sm6 lg4 d-flex>
          <div v-if="showSideBar">
            <v-autocomplete
              class="sidebar-item"
              v-show="mostrarClientes"
              style="padding-top: 23px"
              v-model="selectedCliente"
              item-value="id"
              item-text="nombre"
              :input-class="['color-input']"
              no-data-text="Sin resultados"
              :items="clientes"
              color="dark"
              label
              @change="changeCliente"
              @blur="validaCliente"
            >
              <!-- <template v-slot:selection="{ item, index }">
                {{ item.nombre }} [{{ item.rut }}]
              </template> -->
            </v-autocomplete>
          </div>
          <div v-else>{{ nombreCliente }}</div>
        </v-flex>
        <v-spacer></v-spacer>
        <div v-show="showSideBar">
          <v-btn
            v-show="mostrarAlertas"
            fab
            small
            color="transparent"
            @click="showModalNotificacionesAlertas()"
          >
            <v-badge class="badge-sidebar" overlap>
              <span
                slot="badge"
                style="color: black; font-size: 12px; font-weight: bold"
                v-if="muestraNumero"
                >{{ numeroNotificaciones }}</span
              >
              <v-icon medium class="color-header-bar">notifications</v-icon>
            </v-badge>
          </v-btn>
        </div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <div class="text-xs-center" v-if="showSideBar">
          <v-menu offset-y :close-on-content-click="false">
            <v-btn
              class="color-header-bar"
              data-testid="SideBar__v-btn--usuario"
              slot="activator"
              :depressed="true"
            >
              <v-icon>account_circle</v-icon>
              &nbsp;&nbsp;{{ currentUser }} &nbsp;
              <v-icon>keyboard_arrow_down</v-icon>
            </v-btn>
            <v-list>
              <v-list-tile>
                <v-list-tile-title
                  style="cursor: pointer"
                  @click="goToMiPerfil()"
                >
                  <v-icon>person</v-icon>&nbsp;&nbsp;Mi Perfil
                </v-list-tile-title>
              </v-list-tile>
              <v-list-tile v-if="permisosAux">
                <v-list-tile-title style="cursor: pointer" @click="eventoAux()">
                  <v-icon>lock</v-icon>&nbsp;&nbsp;Cambiar Contraseña
                </v-list-tile-title>
              </v-list-tile>
              <v-list-tile>
                <v-list-tile-title
                  style="cursor: pointer"
                  @click="eventoEjecutivo()"
                >
                  <v-icon>assignment_ind</v-icon>&nbsp;&nbsp;Contacto Ejecutivo
                </v-list-tile-title>
              </v-list-tile>
              <v-list-group
                v-if="muestraUsuarios || muestraRoles || muestraPerfiles"
              >
                <template>
                  <v-list-tile slot="activator">
                    <v-icon>people</v-icon>&nbsp;&nbsp;Admin Usuarios
                  </v-list-tile>
                </template>
                <v-list-tile
                  v-if="muestraUsuarios"
                  style="cursor: pointer"
                  @click="gotolink('usuarios')"
                  >Usuarios
                </v-list-tile>
                <v-list-tile
                  v-if="muestraRoles"
                  style="cursor: pointer"
                  @click="gotolink('roles')"
                  >Roles
                </v-list-tile>
                <v-list-tile
                  v-if="muestraPerfiles"
                  style="cursor: pointer"
                  @click="gotolink('perfiles')"
                  >Perfiles
                </v-list-tile>
              </v-list-group>

              <v-list-tile>
                <v-list-tile-title
                  style="cursor: pointer"
                  @click="logoutDialog = true"
                >
                  <v-icon>streetview</v-icon>&nbsp;&nbsp;Cerrar Sesión
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </div>
        <div v-else-if="showSideBar == true && isMobile == 'mobile'">
          <v-btn slot="activator" color="primary" dark :depressed="true">
            <v-icon style="margin-right: 5px">account_circle</v-icon>
            {{ currentUser }}
          </v-btn>
        </div>
      </v-toolbar>
      <app-confirmacion
        :show="logoutDialog"
        titulo="Cerrar Sesión"
        mensaje="¿Confirma cerrar su sesión?"
        v-on:modalConfirmationEmit="logOutCallback($event)"
      ></app-confirmacion>
      <div class="text-xs-center">
        <v-dialog v-model="dialogClienteUsuario" width="500">
          <v-card>
            <v-card-title primary-title class="headline lighten-2"
              >Cliente</v-card-title
            >
            <v-card-text>
              Su sesión de trabajo esta asociada al cliente
              {{ nombreCliente }}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="dialogClienteUsuario = false"
                >Aceptar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
      <app-notificaciones-alertas
        :show="showModalAlertas"
        v-on:modalAsociacionEmit="alertaModalCallback($event)"
      ></app-notificaciones-alertas>
      <app-change-pass
        :show="showModalPass"
        v-on:modalAsociacionEmit="moduloCallback($event)"
      ></app-change-pass>
      <app-contacto-ejecutivo
        :show="showModalEjecutivo"
        v-on:modalContactoEjecutivoEmit="moduloCallbackEjecutivo($event)"
      ></app-contacto-ejecutivo>
    </div>
    <div fixed v-else>
      <VerDetalleModalTab
        @cerrar="handleCerrarVerDetalle"
        :unidadVehiculo="vehiculo ? vehiculo.unidad : ''"
      />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {
  eventBus,
  eventBusSidebarClick,
  filtroHomeEventBus,
  filtroHomeEvents,
} from '@/setup';
import Confirmation from './Confirmation.vue';
import { Component, Watch } from 'vue-property-decorator';
import config from '@/config/index'; //
import { AxiosVue } from '@/AxiosVue';
import store from '@/store';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import { LoadingService } from '@/services/loadingService';
import { FilterService } from '@/services/filterServices';
import NotificacionesAlertas from '@/components/plataforma/NotificacionesAlertas.vue';
import ChangePass from '@/views/auth/ChangePass.vue';
import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import vehiculoEventBus from '../pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import VerDetalleModalTab from '@/pantallas/Inicio/Mapa/VerDetalleModalTab.vue';
import { Actividad } from '../pantallas/Inicio/ActividadesData/fetchActividades';
import ActividadesEventBus from '../eventBus/actividadesEventBus';
import { CodigoAccion } from '../views/base/VariablesPermisos';
import ContactoEjecutivo from '@/views/auth/ContactoEjecutivo.vue';
import { ParametroSistemaVm } from '@/interfaces/parametroSistema';
import moment, { Duration } from 'moment';
import CortaCorrienteEventBus from '@/pantallas/Inicio/CortaCorrienteData/CortaCorrienteEventBus';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';

import { fetchSideBar } from '@/pantallas/Inicio/Sidebar/fetchSideBar';
import { fetchRoute } from '@/pantallas/Inicio/Sidebar/fetchRoute';
import { MSResponse } from '@/interfaces/MS';
import { ClientFilterI } from '@/interfaces/Filters';
import { AxiosResponse } from 'axios';
import { setTimeout } from 'timers';

@Component({
  components: {
    'app-confirmacion': Confirmation,
    'app-notificaciones-alertas': NotificacionesAlertas,
    'app-change-pass': ChangePass,
    VerDetalleModalTab,
    'app-contacto-ejecutivo': ContactoEjecutivo,
  },
})
export default class SideBar extends Vue {
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  $snotify: any;
  aplicaciones: any = [];
  clipped: boolean = true;
  drawer: boolean = false;
  drawerfloat: boolean = true;
  fixed: boolean = false;
  miniVariant: boolean = false;
  logoutDialog: boolean = false;
  title: string = 'Track 3.0';
  clientes: any = [];
  dialogClienteUsuario: boolean = false;
  selectedCliente: any = null;
  nombreCliente: string = '';
  controller: string = 'usuario';
  usuario: any = this.$store.state.user;
  current_dashboard: string = '';
  loadingService = new LoadingService();
  clienteFromStore: number = 0;
  showModalAlertas: boolean = false;
  numeroNotificaciones: number = 0;
  clienteId: number = config.getClienteSesion();
  muestraNumero: boolean = false;
  muestraUsuarios: boolean = false;
  muestraRoles: boolean = false;
  muestraPerfiles: boolean = false;
  mostrarClientes: boolean = true;
  mostrarAlertas: boolean = true;
  showModalPass: boolean = false;
  vehiculo: Vehiculo;
  showModalEjecutivo: boolean = false;
  urlDashboard: string = process.env.VUE_APP_URL_DASHBOARD;
  tiempoVisualizacionPopup: number = 0;
  isMobile: string = '';
  showSideBar: boolean = true;
  cargado: boolean = false;
  permisosAux: any = null;
  token: string = '';

  //AXIOS
  axiosNotificacion: AxiosVue = new AxiosVue(ServicioProxy.Notificacion);
  axiosAuth: AxiosVue;
  ControllerCuenta: string = 'Cuenta';

  detalleVehiculoHomeRendered: boolean = false;

  /*Notificaciones Browser */
  colaNotificacionesBrowser: any[] = [];

  private filterService: FilterService = new FilterService();

  constructor() {
    super();
    this.axiosAuth = new AxiosVue(ServicioProxy.Auth);
  }

  selectComponent(event: any) {
    if (event.includes('dashboard')) {
      if (this.current_dashboard == '' || this.current_dashboard == event) {
        //
      } else {
        CamaraEventBus.$emit('reloadComponent');
      }
      this.current_dashboard = event;
    }
    if (
      event.includes('camaras') &&
      (event.includes('envivo') || event.includes('operaciones'))
    ) {
      CamaraEventBus.$emit('reloadComponentInLives');
    }
    var self = this;
    setTimeout(() => {
      if (self.$router.currentRoute.fullPath == '/menu') {
        document.getElementById('drawerDivSetup').classList.add('drawer');
      } else {
        document.getElementById('drawerDivSetup').classList.remove('drawer');
      }
    }, 300);
  }

  async mounted() {
    if (this.$router.currentRoute.fullPath == '/menu') {
      document.getElementById('drawerDivSetup').classList.add('drawer');
    } else {
      document.getElementById('drawerDivSetup').classList.remove('drawer');
    }
    if (navigator.userAgent.toLowerCase().match(/mobile/i) != null) {
      this.isMobile = 'mobile';
    }
    if ('/repetir-dia' != this.$route.fullPath) {
      this.loadingService.showLoading();
      this.clienteId = config.getClienteSesion();
      if (this.mostrarAlertas == true) {
        try {
          const response = await this.axiosNotificacion.http.get(
            `Notificacion/NotificacionesActivas`
          );
          this.numeroNotificaciones = response.data;
          if (this.numeroNotificaciones == 0) {
            this.numeroNotificaciones = null;
            this.muestraNumero = false;
          } else {
            this.muestraNumero = true;
          }
        } catch (error) {
          this.numeroNotificaciones = null;
          this.muestraNumero = false;
        }
      }
      await this.obtenerParametrosSistemaCliente();
      await this.cargaNotificacionesBrowser();
      this.muestraNotificacionesBrowser();
      this.mostrarAdmin();
    }
    let self = this;
    setInterval(function() {
      self.recargaNotificaciones();
    }, 30000);

    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleVerDetalleVehiculo);
    // this.loadingService.hideLoading();
  }

  async recargaNotificaciones() {
    this.clienteId = config.getClienteSesion();
    if (this.mostrarAlertas == true) {
      try {
        const response = await this.axiosNotificacion.http.get(
          `Notificacion/NotificacionesActivas`
        );
        this.numeroNotificaciones = response.data;

        if (this.numeroNotificaciones == 0) {
          this.numeroNotificaciones = null;
          this.muestraNumero = false;
        } else {
          this.muestraNumero = true;
        }
      } catch (error) {
        this.numeroNotificaciones = null;
        this.muestraNumero = false;
      }
      this.cargaNotificacionesBrowser();
    }
  }

  async cargaNotificacionesBrowser() {
    const res = await this.axiosNotificacion.http.get(
      `Notificacion/NotificacionesBrowserActivas/`
    );
    if (res.data) {
      await res.data.forEach((x: any) => {
        if (!this.colaNotificacionesBrowser.some(c => c.id === x.id)) {
          this.colaNotificacionesBrowser.push(x);
        }
      });
    }
  }

  muestraNotificacionesBrowser() {
    setTimeout(() => {
      if (this.colaNotificacionesBrowser[0]) {
        this.$snotify.warning(this.colaNotificacionesBrowser[0].mensaje, {
          timeout: this.tiempoVisualizacionPopup * 1000,
        });
        const req = {
          NotificacionId: this.colaNotificacionesBrowser[0].id,
          NotificaBrowserEstado: 2,
        };
        this.axiosNotificacion.http
          .put(`Notificacion/CambiarEstadoNotificacion`, req)
          .catch(error => {
            this.$snotify.error(
              'Ocurrio un error al dejar marcada como leida la notificación'
            );
          });
        this.colaNotificacionesBrowser.splice(0, 1);
      }
      this.muestraNotificacionesBrowser();
    }, this.tiempoVisualizacionPopup * 1000 + 1000);
  }

  get isLogued() {
    return this.$store.getters.isAuthenticated;
  }

  get currentUser() {
    return this.$store.state.name + ' ' + this.$store.state.lastname;
  }

  logoutUserNull() {
    if (
      this.$store.state.user.nombre === null ||
      this.$store.state.user.apellidoPaterno === null
    ) {
      this.$snotify.warning(
        'Por favor póngase en contacto con el Administrador.'
      );
      setTimeout(() => {
        this.$router.push('/login');
      }, 7000);
      this.loadingService.hideLoading();
    }
  }

  updated() {
    this.logoutUserNull();
  }

  async goToHome() {
    var homePath = store.state.homePath;
    if (homePath == null || homePath == '') {
      let axiosGestionUsuario: AxiosVue = new AxiosVue(
        ServicioProxy.GestionUsuario
      );
      await axiosGestionUsuario.http
        .get(`usuario/${this.usuario.id}/homePath`)
        .then(res => {
          homePath = res.data.homePath;
          var homePath = res.data.homePath;
          this.$store.commit('setHomePath', homePath);
        });
    }

    //if (homePath == 'Inicio') window.location.href = window.location.origin;
    //else window.location.href = '/' + homePath;
    window.location.href = '/menu';
  }

  async changeCliente(val: any, restauraHome: boolean = true) {
    if (val != undefined) {
      this.loadingService.showLoading();
      var user = JSON.parse(localStorage.getItem('user'));
      const model = {
        UsuarioId: user.id,
        ClienteId: val,
      };
      const response: any = await this.axiosAuth.http.post(
        `${this.ControllerCuenta}/newtoken`,
        model
      );
      window.localStorage.setItem('token', response.data.token);
      this.$store.commit('setToken', response.data.token);
      store.commit('setStateLoadHomeGrid', false);
      await localStorage.setItem('clienteDefecto', val.toString());
      //this.$router.replace('/');

      filtroHomeEventBus.$emit('borrarGrillaVehiculo');
      this.cerrarCortaCorriente();

      store.commit('setGenerandoRuta', false);
      store.commit('setLimpiarMapa', true);

      store.commit('setCantidadVehiculosHome', 0);
      store.commit('setRepetirDiaAbierto', false);

      filtroHomeEventBus.$emit('cerrarCrearZonaHome');

      if (restauraHome) filtroHomeEventBus.$emit('restaurarEstadoHome');

      await filtroHomeEventBus.$emit('clienteCambio', val);

      await this.chequearPermisosMenuChangeCliente(val);

      this.logoutUserNull();
      this.recargaNotificaciones();
      this.$router.replace('/menu');
      await filtroHomeEventBus.$emit('clienteMultiApp', val);
      filtroHomeEventBus.$emit(filtroHomeEvents.cambiarFiltro);
    }
  }

  validaCliente() {
    if (this.selectedCliente == undefined) {
      this.selectedCliente = this.clienteId;
    }
  }

  logOutCallback(val: boolean) {
    this.logoutDialog = false;
    if (val) {
      window.localStorage.setItem('logout', '1');
      this.$store.dispatch('logout');
    }
  }

  async created() {
    await this.loadItemsMenu();
    eventBus.$on('changeTitlePage', (title: string) => {
      this.title = title;
    });

    eventBusSidebarClick.$on('collapseSidebar', (collapse: boolean) => {
      this.drawer = false;
      this.drawerfloat = true;
    });

    //Evento que escucha una solicitud de cambio de Cliente (Buscador de Vehículos del Home)
    eventBus.$on('changeClienteBuscadorVehiculo', (cliente: number) => {
      this.selectedCliente = cliente;
      this.changeCliente(cliente, false);
    });
    //---

    var user = JSON.parse(localStorage.getItem('user'));
    if (user.metabaseDashBoardUrl) {
      this.urlDashboard = user.metabaseDashBoardUrl;
    }

    this.getClienteFromUser();

    this.logoutUserNull();

    // regla de negocio, usuario admintrack no debe mostrar clientes y alertas
    this.mostrarClientes = true;
    this.mostrarAlertas = true;
    if (this.usuario.email === 'admintrack@gpschile.com') {
      this.mostrarClientes = false;
      this.mostrarAlertas = false;
    }

    this.permisosAlertasEIgnicion();
    this.token = window.localStorage.getItem('token');
  }

  async loadItemsMenu() {
    this.aplicaciones = store.getters.getAplicaciones;
    if (this.aplicaciones == null) {
      await this.getSideBar();
    }
  }

  async getSideBar(clienteId = this.clienteId) {
    let model = {
      idUsuario: this.usuario.id,
      idCliente: clienteId,
      token: store.state.token,
    };
    let sidebarResponse = await fetchSideBar(model);
    this.aplicaciones = await sidebarResponse.data.SideBar;
    if (this.aplicaciones.length <= 0) {
      this.$snotify.warning(
        'El cliente seleccionado no tiene aplicaciones asignadas.'
      );
    }
    store.commit('setAplicaciones', this.aplicaciones);
    store.commit('setAppNames', sidebarResponse.data.AppNames);
  }

  async reprocesoPermisoUsuario(clienteId: number) {
    var self = this;
    await this.axiosAuth.http
      .post(
        `${this.ControllerCuenta}/usuarioFuncionalidadesCliente/${this.usuario.id}/${clienteId}`
      )
      .then(async function(response) {
        ///////////////////////////////////////////////////////////////////////////////////////
        if (window.localStorage) {
          window.localStorage.setItem('token', response.data.token);
          window.localStorage.setItem(
            'user',
            JSON.stringify(response.data.usuario)
          );
          window.localStorage.setItem('clienteDefecto', clienteId.toString());
        }
        self.$store.commit('setToken', response.data.token);
        self.$store.commit('authUser', response.data.usuario);
        self.usuario = response.data.usuario;
        self.permisosAux = response.data.usuario.permisosUsuario.filter(
          (x: any) => x.clienteId === clienteId
        );

        ///////////////////////////////////////////////////////////////////////////////////////
      })
      .catch(function(error) {})
      .finally(function() {
        self.loadingService.hideLoading();
      });
  }

  //ChequearPermisosMenuPorModulo
  async ChequearPermisosMenuPorModulo(clienteId: number) {
    this.loadingService.showLoading();
    for (let o = 0; o < this.aplicaciones.length; o++) {
      for (let i = 0; i < this.aplicaciones[o].items.length; i++) {
        let item = this.aplicaciones[o].items[i];

        for (let j = 0; j < item.items.length; j++) {
          var menuOpciones1 = item.items[j];
          menuOpciones1.visible = true;
        }
      }

      let ModulosPorcliente = this.usuario.permisosUsuario.filter(
        (x: any) => x.clienteId === clienteId
      );
      if (ModulosPorcliente != undefined) {
        if (ModulosPorcliente.length == 0) {
          await this.reprocesoPermisoUsuario(clienteId);
          ModulosPorcliente = this.permisosAux.filter(
            (x: any) => x.clienteId === clienteId
          );
        }
      }

      var cantpermisosAplicacion = 0;
      for (let i = 0; i < this.aplicaciones[o].items.length; i++) {
        let item = this.aplicaciones[o].items[i];

        var cantPermisos = 0;
        for (let j = 0; j < item.items.length; j++) {
          var menuOpciones2 = item.items[j];
          var permiso = ModulosPorcliente.find(
            (x: any) =>
              x.moduloCodigo === menuOpciones2.funcionalidad &&
              x.clienteId === clienteId
          );

          if (permiso === undefined) {
            item.items[j].visible = false;
          } else {
            cantPermisos++;
            cantpermisosAplicacion++;
          }
        }

        if (cantPermisos == 0) {
          this.aplicaciones[o].items[i].visible = false;
        }
        cantPermisos = 0;
      }
      if (cantpermisosAplicacion == 0) {
        this.aplicaciones[o].visible = false;
      }
    }
    this.cargado = true;
    //Evita abrir el menu lateral antes que se renderizuen los permisos.
    this.loadingService.hideLoading();
  }

  getClienteFromUser() {
    if (this.usuario !== null) {
      this.axios.http
        .get(`usuario/${this.usuario.id}/cliente`)
        .then(async res => {
          this.clientes = res.data;
          this.clientes = this.clientes.filter(
            (x: any) => x.accesoUsuarios === true
          );

          this.clientes = this.clientes.map((item: any) => {
            let newItem = item;
            newItem.nombre = item.nombre + ' [' + item.rut + ']';
            return newItem;
          });

          if (res.data.length > 0) {
            var cliente = localStorage.getItem('clienteDefecto');
            if (cliente === null) {
              window.localStorage.setItem(
                'clienteDefecto',
                res.data[0].clienteId
              );
              this.nombreCliente = res.data[0].nombre;
              this.selectedCliente = res.data[0].clienteId;
              this.ChequearPermisosMenuPorModulo(res.data[0].clienteId);
            } else {
              const _cliente = res.data.find(
                (x: any) => x.clienteId === parseInt(cliente)
              );
              await window.localStorage.setItem('clienteDefecto', _cliente.id);
              this.nombreCliente = _cliente.nombre;
              this.selectedCliente = _cliente.id;
              this.ChequearPermisosMenuPorModulo(_cliente.id);
            }

            var showMsgCliente = localStorage.getItem('sendMsgCliente');

            if (showMsgCliente != null) {
              this.dialogClienteUsuario = false;
              localStorage.removeItem('sendMsgCliente');
            } else {
              this.dialogClienteUsuario = false;
            }
          } else {
            this.loadingService.hideLoading();
            this.$snotify.warning(
              'Usuario no posee un cliente asociado, por favor póngase en contacto con el administrador.'
            );
            setTimeout(() => {
              this.$router.push('/login');
            }, 3500);
          }
        })
        .catch(err => {
          this.loadingService.hideLoading();
          //this.$snotify.error("Problemas al obtener cliente del usuario");
        });
    }
    this.filterService
      .getClients('')
      .then((response: AxiosResponse<MSResponse<ClientFilterI>>) => {
        this.$store.commit('setClients', response.data.data);
      })
      .catch(() =>
        this.$snotify.warning('Algunos datos no se cargaron correctamente.')
      );
  }

  goToMiPerfil() {
    this.$router.push('/miperfil');
  }
  gotolink(link: string) {
    this.$router.push(`/${link}`);
  }

  showModalNotificacionesAlertas() {
    this.loadingService.showLoading();
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.showModalAlertas = true;
  }

  alertaModalCallback(val: boolean) {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.showModalAlertas = val;
  }

  // REVISAR LOGICA PARA PERMISOS

  async mostrarAdmin() {
    var list = [2, 3, 4];
    var ModulosPorcliente = this.usuario.permisosUsuario.filter(
      (x: any) => x.clienteId === this.clienteId
    );

    this.muestraPerfiles =
      (await ModulosPorcliente.find(
        (x: any) => x.moduloCodigo == 2 && x.clienteId === this.clienteId
      )) != undefined;
    this.muestraRoles =
      (await ModulosPorcliente.find(
        (x: any) => x.moduloCodigo == 3 && x.clienteId === this.clienteId
      )) != undefined;
    this.muestraUsuarios =
      (await ModulosPorcliente.find(
        (x: any) => x.moduloCodigo == 4 && x.clienteId === this.clienteId
      )) != undefined;

    return false;
  }

  async chequearPermisosMenuChangeCliente(clienteId: number) {
    await this.getSideBar(clienteId);
    const loadingKey = 'chequearPermisosMenuChangeCliente';
    this.loadingService.showLoading(undefined, loadingKey);
    let self = this;
    await this.axiosAuth.http
      .post(
        `${this.ControllerCuenta}/usuarioFuncionalidadesCliente/${this.usuario.id}/${clienteId}`
      )
      .then(async function(response) {
        ///////////////////////////////////////////////////////////////////////////////////////
        if (window.localStorage) {
          window.localStorage.setItem('token', response.data.token);
          window.localStorage.setItem(
            'user',
            JSON.stringify(response.data.usuario)
          );
          window.localStorage.setItem('clienteDefecto', clienteId.toString());
        }
        self.$store.commit('setToken', response.data.token);
        self.$store.commit('authUser', response.data.usuario);
        self.usuario = response.data.usuario;
        ///////////////////////////////////////////////////////////////////////////////////////

        let funcionalidadPorcliente = response.data.usuario.permisosUsuario.filter(
          (x: any) => x.clienteId === clienteId
        );

        var permisoAlertas = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Notificaciones &&
            x.clienteId === clienteId
        );
        if (permisoAlertas !== undefined && permisoAlertas !== null) {
          self.mostrarAlertas = true;
          store.commit('setPermisoAlerta', true);
        } else {
          self.mostrarAlertas = false;
          store.commit('setPermisoAlerta', false);
        }

        var permisoHistorico = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.HistoricoMantenimiento &&
            x.clienteId === clienteId
        );
        if (permisoHistorico !== undefined && permisoHistorico !== null) {
          store.commit('setPermisoHistorico', true);
        } else {
          store.commit('setPermisoHistorico', false);
        }

        // Permiso de Facturacion
        var permisoFacturacion = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Facturacion &&
            x.clienteId === clienteId
        );
        if (permisoFacturacion !== undefined && permisoFacturacion !== null) {
          store.commit('setPermisoFacturacion', true);
        } else {
          store.commit('setPermisoFacturacion', false);
        }

        // Permiso de Solicitudes
        var permisoSolicitudes = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Solicitudes &&
            x.clienteId === clienteId
        );
        if (permisoSolicitudes !== undefined && permisoSolicitudes !== null) {
          store.commit('setPermisoSolicitudes', true);
        } else {
          store.commit('setPermisoSolicitudes', false);
        }

        // Permiso de Chat
        var permisoChat = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Chat && x.clienteId === clienteId
        );
        if (permisoChat !== undefined && permisoChat !== null) {
          store.commit('setPermisoChat', true);
        } else {
          store.commit('setPermisoChat', false);
        }

        //566 - Home - Refresco de mapa
        var permisoCrearZona = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Zonas &&
            x.clienteId === clienteId
        );

        if (permisoCrearZona !== undefined && permisoCrearZona !== null)
          store.commit('setPermisoCrearZonaHome', true);
        else store.commit('setPermisoCrearZonaHome', false);
        //---

        // permisos Inicio
        var permisoHomeIndicadores = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Inicio &&
            x.accionCodigo === CodigoAccion.Indicadores &&
            x.clienteId === clienteId
        );

        if (
          permisoHomeIndicadores !== undefined &&
          permisoHomeIndicadores !== null
        ) {
          store.commit('setPermisoIndicadores', true);
        } else {
          store.commit('setPermisoIndicadores', false);
        }

        var permisoHomeRepetirDia = funcionalidadPorcliente.find(
          (x: any) =>
            x.moduloCodigo === Funcionalidades.Inicio &&
            x.accionCodigo == CodigoAccion.RepetirDia &&
            x.clienteId === clienteId
        );

        if (
          permisoHomeRepetirDia !== undefined &&
          permisoHomeRepetirDia !== null
        ) {
          store.commit('setPermisoRepetirDia', true);
        } else {
          store.commit('setPermisoRepetirDia', false);
        }
        //---

        await self.ChequearPermisosMenuPorModulo(clienteId);
      })
      .catch(function(error) {})
      .finally(function() {
        self.loadingService.hideLoading(loadingKey);
      });
  }

  permisosAlertasEIgnicion() {
    this.clienteId = config.getClienteSesion();

    let modulosPorcliente = this.usuario.permisosUsuario.filter(
      (x: any) => x.clienteId === this.clienteId
    );
    //Consulta por permisos de alerta
    var permisoAlertas = modulosPorcliente.find(
      (x: any) =>
        x.nombreAccion === 'Consultar' &&
        x.accionCodigo === 1 &&
        x.moduloCodigo === Funcionalidades.Notificaciones &&
        x.clienteId === this.clienteId
    );
    if (permisoAlertas !== undefined && permisoAlertas !== null) {
      this.mostrarAlertas = true;
      store.commit('setPermisoAlerta', true);
    } else {
      this.mostrarAlertas = false;
      store.commit('setPermisoAlerta', false);
    }
    //Consulta por permisos de Ignicion
    var permisoIgnicion = modulosPorcliente.find(
      (x: any) =>
        x.nombreAccion === 'Corte de segunda ignición' &&
        x.accionCodigo === 7 &&
        x.moduloCodigo === Funcionalidades.Inicio &&
        x.clienteId === this.clienteId
    );

    if (permisoIgnicion !== undefined && permisoIgnicion !== null) {
      //this.mostrarAlertas = true;
      store.commit('setPermisoIgnicion', true);
    } else {
      //this.mostrarAlertas = false;
      store.commit('setPermisoIgnicion', false);
    }

    //Consulta por permisos de Ignicion
    var permisoIndicadores = modulosPorcliente.find(
      (x: any) =>
        x.nombreAccion === 'Indicadores' &&
        x.accionCodigo === 8 &&
        x.moduloCodigo === Funcionalidades.Inicio &&
        x.clienteId === this.clienteId
    );

    if (permisoIndicadores !== undefined && permisoIndicadores !== null) {
      store.commit('setPermisoIndicadores', true);
    } else {
      store.commit('setPermisoIndicadores', false);
    }

    var permisoHistorico = modulosPorcliente.find(
      (x: any) =>
        x.moduloCodigo === Funcionalidades.HistoricoMantenimiento &&
        x.nombreAccion === 'Consultar' &&
        x.accionCodigo === 1 &&
        x.clienteId === this.clienteId
    );
    if (permisoHistorico !== undefined && permisoHistorico !== null) {
      store.commit('setPermisoHistorico', true);
    } else {
      store.commit('setPermisoHistorico', false);
    }

    // Permiso de Facturacion
    var permisoFacturacion = modulosPorcliente.find(
      (x: any) =>
        x.moduloCodigo === Funcionalidades.Facturacion &&
        x.nombreAccion === 'Consultar' &&
        x.accionCodigo === 1 &&
        x.clienteId === this.clienteId
    );
    if (permisoFacturacion !== undefined && permisoFacturacion !== null) {
      store.commit('setPermisoFacturacion', true);
    } else {
      store.commit('setPermisoFacturacion', false);
    }

    // Permiso de Solicitudes
    var permisoSolicitudes = modulosPorcliente.find(
      (x: any) =>
        x.moduloCodigo === Funcionalidades.Solicitudes &&
        x.nombreAccion === 'Consultar' &&
        x.accionCodigo === 1 &&
        x.clienteId === this.clienteId
    );
    if (permisoSolicitudes !== undefined && permisoSolicitudes !== null) {
      store.commit('setPermisoSolicitudes', true);
    } else {
      store.commit('setPermisoSolicitudes', false);
    }

    // Permiso de Chat
    var permisoChat = modulosPorcliente.find(
      (x: any) =>
        x.moduloCodigo === Funcionalidades.Chat &&
        x.nombreAccion === 'Consultar' &&
        x.accionCodigo === 1 &&
        x.clienteId === this.clienteId
    );
    if (permisoChat !== undefined && permisoChat !== null) {
      store.commit('setPermisoChat', true);
    } else {
      store.commit('setPermisoChat', false);
    }
  }
  eventoAux() {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.showModalPass = true;
  }

  eventoEjecutivo() {
    document.getElementsByTagName('html')[0].style.overflow = 'hidden';
    this.showModalEjecutivo = true;
  }

  moduloCallbackEjecutivo(val: boolean) {
    this.showModalEjecutivo = val;
  }

  moduloCallback(val: boolean) {
    this.showModalPass = val;
  }

  cerrarCortaCorriente() {
    const data: any = {
      show: false,
      vehiculoId: 0,
      showCorteIgnicion: false,
      fechaRecepcion: null,
      usuarioId: 0,
      dataComunicacion: {
        mensajeTxt: '',
        fechaSolicitudTxt: '',
        estadoTxt: '',
        usuarioTxt: '',
      },
    };
    // store.commit('setRepetirDiaAbierto', false);
    //actividadesEventBus

    CortaCorrienteEventBus.abrirCortaCorrienteHome(data);
    store.commit('setCortaCorrienteAbierto', false);
    store.commit('setCortaCorrienteAbiertoAux', false);

    /*ActividadesEventBus.$emit('setCortaCorrienteOpen', {
        show: data,
      });*/
  }

  handleVerDetalleVehiculo(
    vehiculo: Vehiculo,
    actividades: Actividad,
    ultimaActividad: Actividad,
    show: boolean
  ) {
    this.vehiculo = vehiculo;
    this.detalleVehiculoHomeRendered = show;
  }

  handleCerrarVerDetalle() {
    vehiculoEventBus.abrirDetalleVehiculo(
      this.vehiculo,
      null,
      null,
      false,
      '0'
    );
    this.detalleVehiculoHomeRendered = false;
  }

  obtenerParametrosSistemaCliente() {
    return this.axios.http
      .get<ParametroSistemaVm>(`ParametroSistema/${this.clienteId}/cliente`)
      .then((ps: any) => {
        this.tiempoVisualizacionPopup = this.obtenerMoment(
          ps.data.tiempoVisualizacionPopup
        ).asSeconds();
      })
      .catch(error => {});
  }

  tieneHijos(p: any) {
    return p.length > 1;
  }

  private obtenerMoment(valor: string): Duration {
    const regexHoras: RegExp = /^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]$/;

    if (regexHoras.test(valor)) {
      return moment.duration(moment(valor, 'HH:mm:ss').format('HH:mm:ss'));
    }

    return moment.duration(moment(valor, 'DD.HH:mm:ss').format('DD.HH:mm:ss'));
  }

  get areApplicationUpdated(): boolean {
    return this.$store.getters.getApplicatenUpdated;
  }

  @Watch('areApplicationUpdated')
  watchAreApplicationUpdated() {
    this.getSideBar();
  }
}
</script>
<style scoped></style>
