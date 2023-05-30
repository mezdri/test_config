import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import moment from 'moment';
import 'moment/locale/es';
import Snotify, { SnotifyPosition } from 'vue-snotify';
import 'vue-snotify/styles/material.css';
import i18n from '@/config/i18n';
import es from '@/config/lang_validator_es';
import VeeValidate, { Validator } from 'vee-validate';
import { IRepetirDia } from '@/interfaces/RepetirDia';
import '../node_modules/ag-grid-community/dist/styles/ag-grid.css';
import '../node_modules/ag-grid-community/dist/styles/ag-theme-material.css';

import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { FiltroHomeEventBus } from './eventBus/filtroHomeEventBus';
import { AsociacionEventBus } from './eventBus/asociacionEventBus';
import { EsmaxDashboardEventBus } from './eventBus/esmaxDashboardEventBus';
import { DatosSertecEventBus } from './eventBus/datosSertecEventBus';
import { Funcionalidades } from '@/config/funcionalidades';
import { Accion, HomeFiltros } from '@/config/enums';
import { ICellRendererParams } from 'ag-grid-community';
import Fragment from '@/reusable/Fragment.vue';

LicenseManager.setLicenseKey(process.env.VUE_APP_AGGRID_API_KEY);

const options = {
  toast: { position: SnotifyPosition.rightTop, timeout: 4000 },
};

Validator.localize('es', es);
Vue.use(VeeValidate, {
  classes: true,
});
Vue.use(Snotify, options);

moment.locale('es', {
  invalidDate: '',
});

// filters
Vue.filter('formatDate', (value: any) => {
  if (value) {
    return moment(String(value)).format('DD/MM/YYYY');
  }
});
Vue.filter('limitString', (text: string, length: number, suffix: boolean) => {
  if (text) {
    return text.substring(0, length) + suffix;
  }
});

Vue.use({
  install: function(Vue) {
    Vue.component('Fragment', Fragment);
  },
});

type ActionsEventParams = {
  funcionalidad: Funcionalidades;
  action: Accion;
  id: -1 | any;
  cellRendererParams: ICellRendererParams;
};

type ActionsEventListener = {
  (params: ICellRendererParams): void;
};

export const actionsEvent = new Vue({
  data: {
    events: {
      actionsEvent: 'actionsEvent',
    },
  },
  methods: {
    _onAccion(accion: Accion, callbackfn: ActionsEventListener) {
      this.$on(this.events.actionsEvent, (params: ActionsEventParams) => {
        if (params.action === accion) {
          callbackfn(params.cellRendererParams);
        }
      });
    },

    removeListeners() {
      this.$off(this.events.actionsEvent);
    },

    onDejarDeRecibir(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.DejarRecibirInformacion, callbackfn);
    },

    onAceptar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.AceptarInformacionCompartida, callbackfn);
    },

    onRechazar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.RechazarInformacionCompartida, callbackfn);
    },

    onVerDetalle(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.VerDetalle, callbackfn);
    },

    onEditar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Editar, callbackfn);
    },

    onCargarArchivo(callbackfn: ActionsEventListener) {
      console.log('onCargarArchivo');
      console.log(callbackfn);
      this._onAccion(Accion.cargarArchivo, callbackfn);
    },

    onCompartir(callbackfn: ActionsEventListener) {
      console.log('onCompartir');
      console.log(callbackfn);
      this._onAccion(Accion.compartir, callbackfn);
    },

    onEliminar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Eliminar, callbackfn);
    },

    onEliminarApn(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EliminarApn, callbackfn);
    },

    onEditarApn(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EditarApn, callbackfn);
    },

    onEliminarStock(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EliminarStock, callbackfn);
    },

    onEditarStock(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EditarStock, callbackfn);
    },

    onElminarPlan(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EliminarPlan, callbackfn);
    },

    onEditarPlan(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EditarPlan, callbackfn);
    },

    onElminarApnCrear(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EliminarApnCrear, callbackfn);
    },

    onEditarApnCrear(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EditarApnCrear, callbackfn);
    },

    onEliminarStockCrear(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EliminarStockCrear, callbackfn);
    },

    onEditarStockCrear(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EditarStockCrear, callbackfn);
    },
    onDejarDeCompartir(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.NoRecibirInformacion, callbackfn);
    },

    onDesbloquear(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Desbloquear, callbackfn);
    },

    onDescargar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Descargar, callbackfn);
    },

    onCancelar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Cancelar, callbackfn);
    },

    onEnviarComando(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.EnviarComando, callbackfn);
    },

    onEnviar(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Enviar, callbackfn);
    },

    onVerPdf(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.VerPdf, callbackfn);
    },
    onExportaraCRM(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Exportar_A_CRM, callbackfn);
    },

    onVerReferencia(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.VerReferencia, callbackfn);
    },

    onAnular(callbackfn: ActionsEventListener) {
      this._onAccion(Accion.Anular, callbackfn);
    },
  },
});

export const eventBus = new Vue({
  methods: {
    changeTitlePage(title = 'Track 3.0') {
      this.$emit('changeTitlePage', title);
    },
    //Escucha cuando se pide Cambiar un Cliente (Buscador de Vehículo en el Home)
    changeClienteBuscadorVehiculo(cliente: number) {
      this.$emit('changeClienteBuscadorVehiculo', cliente);
    },
    //---
  },
});

export const eventBusSidebarClick = new Vue({
  methods: {
    collapseSidebar(collapse: boolean = false) {
      this.$emit('collapseSidebar', collapse);
    },
  },
});

export const filtroHomeEventBus: FiltroHomeEventBus = new FiltroHomeEventBus();
export const asociacionEventBus: AsociacionEventBus = new AsociacionEventBus();
export const esmaxDashboardEventBus: EsmaxDashboardEventBus = new EsmaxDashboardEventBus();
export const datosSertecEventBus: DatosSertecEventBus = new DatosSertecEventBus();
export const filtroHomeEvents = {
  cambiarFiltro: 'cambiarFiltro',
};

export const repetirDiaEvents = {
  abrir: 'repetirDia-abrir',
  cerrar: 'repetirDia-cerrar',
};
export const repetirDiaEventBus = new Vue({
  methods: {
    abrir(data: IRepetirDia): void {
      this.$emit(repetirDiaEvents.abrir, data);
    },
    cerrar() {
      this.$emit(repetirDiaEvents.cerrar);
    },

    /*
    TODO reemplazar bus.$on() por estos métodos para asegurar tipos correctos
    Depende instanciar eventBus en cada componente y para limpiar listeners.
     */
    onAbrir(callbackfn: (data: IRepetirDia) => void): void {
      this.$on(repetirDiaEvents.abrir, callbackfn);
    },
    onCerrar(callbackfn: () => void): void {
      this.$on(repetirDiaEvents.cerrar, callbackfn);
    },
  },
});

// check local storage to handle refreshes
if (window.localStorage) {
  var token: string = window.localStorage.getItem('token');
  if (token) {
    store.commit('setToken', token);

    var user: string = window.localStorage.getItem('user');
    if (user) {
      store.commit('authUser', JSON.parse(user));
    }
  }
}

Vue.config.productionTip = false;

export const mount = () =>
  new Vue({
    router,
    i18n,
    store,
    render: h => h(App),
  }).$mount('#app');
