import Vue from 'vue';
import Vuex from 'vuex';
import router from '@/router';
import { FlattenStage } from 'ag-grid-community';
Vue.use(Vuex);
// TODO IMPORTANTE | SE NECESITA SIMPLIFICAR ESTE ARCHIVO
export default new Vuex.Store({
  state: {
    token: null,
    userId: null,
    homePath: '',
    name: null,
    lastname: null,
    user: null,
    funcionalidades: [],
    permisosUsuario: [],
    homeFiltro: null,
    clienteId: null,
    actividadActual: null,
    actividadActualDetalle: null,
    cambiaHeigth: null,
    vehiculoActual: null,
    cantidadVehiculosHome: null,
    repetirDiaAbierto: null,
    cortaCorrienteAbierto: null,
    cortaCorrienteAbiertoAux: null,
    generandoRuta: null,
    limpiarMapa: false,
    stateLoadZonaManteiner: false,
    stateLoadZonaMap: false,
    stateLoadHomeGridDetalle: false,
    stateLoadHomeGrid: false,
    seleccionarTipoMapa: 'roadmap',
    seleccionarZoom: 13,
    seleccionarCoordenadas: new google.maps.LatLng(-33.4372, -70.6506),
    esDibujar: false,
    esCrearZonaHome: true, //566 - Home - Refresco de mapa
    permisoIndicadores: true,
    permisoRepetirDia: true,
    permisoAlerta: true,
    permisoIgnicion: true,
    cantActividad: 0,
    permisoHistorico: true,
    permisoFacturacion: true,
    permisoSolicitudes: true,
    permisoChat: false,
    ultimaActividad: null,
    actividadSeleccionada: null,
    seleccionAsignacion: { key: null, value: null },
    cliens: [],
    integrationConfig: {}, // Esto se usa en la vista de activacion/desactivacion de integraciones en coneca
    areApplicationUpdated: true,
    aplicaciones: null,
    appNames: [],
  },
  mutations: {
    //REPETIR DIA 2.0 ///////////////////////
    setClickDetalle(state, actividad) {
      state.actividadActual = actividad;
    },
    setClickActividadDetalle(state, actividad) {
      state.actividadActualDetalle = actividad;
    },
    ////////////////////////////////////////
    setToken(state, token) {
      state.token = token;
    },
    setSeleccionarTipoMapa(state, seleccionarTipoMapa) {
      state.seleccionarTipoMapa = seleccionarTipoMapa;
    },
    setSeleccionarZoom(state, seleccionarZoom) {
      state.seleccionarZoom = seleccionarZoom;
    },
    setSeleccionarCoordenadas(state, seleccionarCoordenadas) {
      state.seleccionarCoordenadas = seleccionarCoordenadas;
    },
    setEsDibujar(state, esDibujar) {
      state.esDibujar = esDibujar;
    },
    setActividad(state, actividadActual) {
      state.actividadActual = actividadActual;
    },
    setActividadDetalle(state, actividadActual) {
      state.actividadActual = actividadActual;
    },
    setCantidadVehiculosHome(state, cantidadVehiculosHome) {
      state.cantidadVehiculosHome = cantidadVehiculosHome;
    },
    setCambiaHeigth(state, cambiaHeigth) {
      state.cambiaHeigth = cambiaHeigth;
    },
    setVehiculoActual(state, vehiculoActual) {
      state.vehiculoActual = vehiculoActual;
    },
    setCortaCorrienteAbierto(state, cortaCorrienteAbierto) {
      state.cortaCorrienteAbierto = cortaCorrienteAbierto;
    },
    setCortaCorrienteAbiertoAux(state, cortaCorrienteAbiertoAux) {
      state.cortaCorrienteAbiertoAux = cortaCorrienteAbiertoAux;
    },
    setRepetirDiaAbierto(state, repetirDiaAbierto) {
      state.repetirDiaAbierto = repetirDiaAbierto;
    },
    setGenerandoRuta(state, generandoRuta) {
      state.generandoRuta = generandoRuta;
    },
    setAplicaciones(state, aplicaciones) {
      state.aplicaciones = aplicaciones;
    },
    setApplicationUptaded(state) {
      // ESTO SE USA COMO FLAG SOLAMENTE PARA DETECTAR EL CAMBIO DE LAS APLICACIONES
      state.areApplicationUpdated = !state.areApplicationUpdated;
    },
    setAppNames(state, appNames) {
      state.appNames = appNames;
    },
    setGenerandoRutaActividadDetalle(state, generandoRuta) {
      state.generandoRuta = generandoRuta;
    },
    setLimpiarMapa(state, limpiarMapa) {
      state.limpiarMapa = limpiarMapa;
    },
    setHomePath(state, homePath) {
      state.homePath = homePath;
    },
    authUser(state, userData) {
      state.user = userData;
      state.userId = userData.id;
      state.name = userData.nombre;
      state.lastname = userData.apellidoPaterno;
      state.funcionalidades = userData.funcionalidades;
      state.permisosUsuario = userData.permisosUsuario;
    },
    setFiltroHome(state, filtro) {
      state.homeFiltro = filtro;
    },
    setCliente(state, clienteId) {
      state.clienteId = clienteId;
    },
    setClients(state, cliens) {
      state.cliens = cliens;
    },
    setIntegrationConfig(state, integrationConfig) {
      state.integrationConfig = integrationConfig;
    },
    clearAuthData(state) {
      state.token = null;
      state.userId = null;
      //state.name = null;
      //state.lastname = null;

      var logout = window.localStorage.getItem('logout');
      if (logout !== null) {
        window.localStorage.removeItem('logout');
      } else {
        window.localStorage.setItem('showSesionExpirada', '1');
      }
      localStorage.removeItem('clienteDefecto');
      location.href = '/login';
      //router.replace("/login");
    },
    setStateLoadZonaManteiner(state, stateLoad) {
      state.stateLoadZonaManteiner = stateLoad;
    },
    setStateLoadZonaMap(state, stateLoad) {
      state.stateLoadZonaMap = stateLoad;
    },
    setStateLoadHomeGridDetalle(state, stateLoad) {
      state.stateLoadHomeGridDetalle = stateLoad;
    },
    setStateLoadHomeGrid(state, stateLoad) {
      state.stateLoadHomeGrid = stateLoad;
    },
    setPermisoCrearZonaHome(state, stateLoad) {
      //566 - Home - Refresco de mapa
      state.esCrearZonaHome = stateLoad;
    },
    setPermisoIndicadores(state, stateLoad) {
      state.permisoIndicadores = stateLoad;
    },
    setPermisoRepetirDia(state, stateLoad) {
      state.permisoRepetirDia = stateLoad;
    },
    setPermisoAlerta(state, stateLoad) {
      state.permisoAlerta = stateLoad;
    },
    setPermisoIgnicion(state, stateLoad) {
      state.permisoIgnicion = stateLoad;
    },
    setCantActividad(state, stateLoad) {
      state.cantActividad = stateLoad;
    },
    setPermisoHistorico(state, stateLoad) {
      state.permisoHistorico = stateLoad;
    },
    setPermisoFacturacion(state, stateLoad) {
      state.permisoFacturacion = stateLoad;
    },
    setPermisoSolicitudes(state, stateLoad) {
      state.permisoSolicitudes = stateLoad;
    },
    setPermisoChat(state, stateLoad) {
      state.permisoChat = stateLoad;
    },
    setActividadSeleccionada(state, stateLoad) {
      state.actividadSeleccionada = stateLoad;
    },
    setUltimaActividad(state, stateLoad) {
      state.ultimaActividad = stateLoad;
    },
    setSeleccionAsignacion(state, seleccion) {
      state.seleccionAsignacion = seleccion;
    },
  },
  actions: {
    logout({ commit }) {
      commit('clearAuthData');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      //router.replace("/login");
      location.href = '/login';
    },
  },
  getters: {
    user(state) {
      return state.user;
    },
    getTipoMapa(state) {
      return state.seleccionarTipoMapa;
    },
    getZoom(state) {
      return state.seleccionarZoom;
    },
    getCoordenadas(state) {
      return state.seleccionarCoordenadas;
    },
    getEsDibujar(state) {
      return state.esDibujar;
    },
    gethomePath(state) {
      return state.homePath;
    },
    isAuthenticated(state) {
      return state.token !== null;
    },
    getHomeFiltro(state) {
      return {
        homeFiltro: state.homeFiltro,
      };
    },
    getCliente(state) {
      return {
        clienteId: state.clienteId,
      };
    },
    getClients(state) {
      return state.cliens;
    },
    getIntegrationConfig(state) {
      return state.integrationConfig;
    },
    getRepetirDiaAbierto(state) {
      return {
        repetirDiaAbierto: state.repetirDiaAbierto,
      };
    },
    getcortaCorrienteAbierto(state) {
      return {
        cortaCorrienteAbierto: state.cortaCorrienteAbierto,
      };
    },
    getcortaCorrienteAbiertoAux(state) {
      return {
        cortaCorrienteAbiertoAux: state.cortaCorrienteAbiertoAux,
      };
    },
    getActividadActual(state) {
      return {
        actividadActual: state.actividadActual,
      };
    },
    getVehiculoActual(state) {
      return {
        vehiculoActual: state.vehiculoActual,
      };
    },
    getActividadSeleccionada(state) {
      return {
        actividadSeleccionada: state.actividadSeleccionada,
      };
    },
    getUltimaActividad(state) {
      return {
        ultimaActividad: state.ultimaActividad,
      };
    },
    getCantActividad(state) {
      return {
        cantActividad: state.cantActividad,
      };
    },
    isLoadedZona(state) {
      var flagExpired = window.localStorage.getItem('showSesionExpirada');
      if (flagExpired === '1') {
        return true;
      } else {
        if (state.stateLoadZonaManteiner && state.stateLoadZonaMap) {
          return true;
        } else {
          return false;
        }
      }
    },
    isLoadedHome(state) {
      var flagExpired = window.localStorage.getItem('showSesionExpirada');
      if (flagExpired === '1') {
        return true;
      } else {
        if (state.stateLoadHomeGridDetalle && state.stateLoadHomeGrid) {
          return true;
        } else {
          return false;
        }
      }
    },
    getPermisoCrearZonaHome(state) {
      //566 - Home - Refresco de mapa
      return state.esCrearZonaHome;
    },
    getPermisoIndicadores(state) {
      return state.permisoIndicadores;
    },
    getPermisoRepetirDia(state) {
      return state.permisoRepetirDia;
    },
    getPermisoAlerta(state) {
      return state.permisoAlerta;
    },
    getPermisoHistorico(state) {
      return state.permisoHistorico;
    },
    getPermisoFacturacion(state) {
      return state.permisoFacturacion;
    },
    getPermisoSolicitudes(state) {
      return state.permisoSolicitudes;
    },
    getPermisoChat(state) {
      return state.permisoChat;
    },
    getSeleccionAsignacion(state) {
      return state.seleccionAsignacion;
    },
    getAplicaciones(state) {
      return state.aplicaciones;
    },
    getApplicationNames(state) {
      return state.appNames;
    },
    getApplicatenUpdated(state) {
      return state.areApplicationUpdated;
    },
  },
});
