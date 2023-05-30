import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import store from '@/store';
import { ServicioProxy } from './config/enums';
import { LoadingService } from '@/services/loadingService';

export interface IContextoProxy {
  Servicio: ServicioProxy;
  BaseUrl: string;
}

const contextos: IContextoProxy[] = [
  {
    Servicio: ServicioProxy.MS,
    BaseUrl: process.env.VUE_APP_SERVICIO_MS,
  },
  {
    Servicio: ServicioProxy.MSLOGIN,
    BaseUrl: process.env.VUE_APP_SERVICIO_MS_LOGIN,
  },
  {
    Servicio: ServicioProxy.Cliente,
    BaseUrl: process.env.VUE_APP_SERVICIO_CLIENTE,
  },
  {
    Servicio: ServicioProxy.GestionUsuario,
    BaseUrl: process.env.VUE_APP_SERVICIO_USUARIO,
  },
  {
    Servicio: ServicioProxy.Gps,
    BaseUrl: process.env.VUE_APP_SERVICIO_GPS,
  },
  {
    Servicio: ServicioProxy.Sitio,
    BaseUrl: process.env.VUE_APP_SERVICIO_SITIO,
  },
  {
    Servicio: ServicioProxy.Vehiculo,
    BaseUrl: process.env.VUE_APP_SERVICIO_VEHICULO,
  },
  {
    Servicio: ServicioProxy.Auth,
    BaseUrl: process.env.VUE_APP_SERVICIO_AUTH,
  },
  {
    Servicio: ServicioProxy.Reporte,
    BaseUrl: process.env.VUE_APP_SERVICIO_REPORTE,
  },
  {
    Servicio: ServicioProxy.Alerta,
    BaseUrl: process.env.VUE_APP_SERVICIO_ALERTA,
  },
  {
    Servicio: ServicioProxy.Importacion,
    BaseUrl: process.env.VUE_APP_SERVICIO_IMPORTACION,
  },
  {
    Servicio: ServicioProxy.Contacto,
    BaseUrl: process.env.VUE_APP_SERVICIO_CONTACTO,
  },
  {
    Servicio: ServicioProxy.Mantenimiento,
    BaseUrl: process.env.VUE_APP_SERVICIO_MANTENIMIENTO,
  },
  {
    Servicio: ServicioProxy.Integracion,
    BaseUrl: process.env.VUE_APP_SERVICIO_INTEGRACION,
  },
  {
    Servicio: ServicioProxy.Calendario,
    BaseUrl: process.env.VUE_APP_SERVICIO_CALENDARIO,
  },
  {
    Servicio: ServicioProxy.Notificacion,
    BaseUrl: process.env.VUE_APP_SERVICIO_NOTIFICACION,
  },
  {
    Servicio: ServicioProxy.Dispositivo,
    BaseUrl: process.env.VUE_APP_SERVICIO_DISPOSITIVO,
  },
  {
    Servicio: ServicioProxy.Comercial,
    BaseUrl: process.env.VUE_APP_SERVICIO_COMERCIAL,
  },
  {
    Servicio: ServicioProxy.Metabase,
    BaseUrl: process.env.VUE_APP_SERVICIO_METABASE,
  },
  {
    Servicio: ServicioProxy.Copiloto,
    BaseUrl: process.env.VUE_APP_SERVICIO_COPILOTO,
  },
  {
    Servicio: ServicioProxy.Sugal,
    BaseUrl: process.env.VUE_APP_SERVICIO_SUGAL,
  },
];

type AxiosApi = {
  instance: AxiosInstance;
  servicio: ServicioProxy;
};

const makeAxiosApi = (servicio: ServicioProxy): AxiosApi => ({
  instance: axios.create({
    baseURL: contextos.find(x => x.Servicio === servicio).BaseUrl,
    timeout: 1_800_000,
    params: {},
  }),
  servicio,
});

export const axiosApis = {
  cliente: makeAxiosApi(ServicioProxy.Cliente),
  gestionUsuario: makeAxiosApi(ServicioProxy.GestionUsuario),
  gps: makeAxiosApi(ServicioProxy.Gps),
  sitio: makeAxiosApi(ServicioProxy.Sitio),
  vehiculo: makeAxiosApi(ServicioProxy.Vehiculo),
  auth: makeAxiosApi(ServicioProxy.Auth),
  reporte: makeAxiosApi(ServicioProxy.Reporte),
  alerta: makeAxiosApi(ServicioProxy.Alerta),
  importar: makeAxiosApi(ServicioProxy.Importacion),
  contacto: makeAxiosApi(ServicioProxy.Contacto),
  mantenimiento: makeAxiosApi(ServicioProxy.Mantenimiento),
  integracion: makeAxiosApi(ServicioProxy.Integracion),
  calendario: makeAxiosApi(ServicioProxy.Calendario),
  notificacion: makeAxiosApi(ServicioProxy.Notificacion),
  dispositivo: makeAxiosApi(ServicioProxy.Dispositivo),
  comercial: makeAxiosApi(ServicioProxy.Comercial),
  metabase: makeAxiosApi(ServicioProxy.Metabase),
  copiloto: makeAxiosApi(ServicioProxy.Copiloto),
  sugal: makeAxiosApi(ServicioProxy.Sugal),

  //  Asignacion: makeAxiosApi(ServicioProxy.Asignacion),
  ms: makeAxiosApi(ServicioProxy.MS),
  mslogin: makeAxiosApi(ServicioProxy.MSLOGIN),
};

export class AxiosVue {
  loadingService = new LoadingService();
  http: AxiosInstance;

  /* TODO: Agregar esto, para obtener configuración de entorno desde config.json
interface IConfigAmbiente {
  title: string
}
private config: IConfigAmbiente;
*/

  constructor(public proxy: ServicioProxy) {
    /* TODO: Agregar esto, para obtener configuración de entorno desde config.json
  axios.get("config.json")
    .then(response => {
      this.config = response.data;
      console.log('Config Actual: ', this.config);
    })
    .catch(reason => {
      console.log('Error al obtener configuracion desde JSON: ', reason);
    });
   */
    const proxyContexto: IContextoProxy = contextos.find(
      x => x.Servicio === proxy
    );

    if (proxyContexto != null) {
      const axiosApi = Object.values(axiosApis).find(
        axiosApi => axiosApi.servicio === proxy
      );
      const defaultInstance = axios.create({
        baseURL: proxyContexto.BaseUrl,
        timeout: 1_800_000,
        params: {},
      });
      this.http = axiosApi.instance || defaultInstance;

      this.registrarInterceptorRequest();
      this.registrarInterceptorResponse();
    }
  }

  private registrarInterceptorRequest() {
    const interceptor = this.http.interceptors.request;
    interceptor.use(
      (config: AxiosRequestConfig) => {
        const token: string = store.state.token;
        if (token) {
          config.headers.common.Authorization = 'Bearer ' + token;
        } else {
          config.headers.common['Content-Type'] =
            'application/x-www-form-urlencoded';
        }
        let requestSize =
          config.data == null ? 0 : JSON.stringify(config.data).length;

        // @ts-ignore
        config.metadata = {
          startTime: new Date(),
          method: config.method,
          baseUrl: config.baseURL,
          url: config.url,
          requestSize: requestSize,
        };
        return config;
      },
      error => {
        this.loadingService.hideLoading();
        return Promise.reject(error);
      }
    );
  }

  private registrarInterceptorResponse() {
    const interceptor = this.http.interceptors.response;
    interceptor.use(
      (response: AxiosResponse) => {
        const ambientesValidos = [
          'Ambiente Desarrollo 1',
          'Ambiente Desarrollo 2',
          'Ambiente QA1',
          'Ambiente QA2',
        ];
        const nuevoToken = response.headers['nuevo-token'];
        if (nuevoToken != null) {
          window.localStorage.setItem('token', nuevoToken);
          store.commit('setToken', nuevoToken);
        }

        const tokenModificado = response.headers['permisos-modificados'];
        if (tokenModificado != null) {
          // Mostrar mensaje de cierre de sesión por cambio de perfilamiento
          window.localStorage.setItem('showLogoutPermisos', '1');
          window.localStorage.setItem('logout', '1');
          store.dispatch('logout');
        }
        return response;
      },
      error => {
        this.loadingService.hideLoading();
        if (error.response !== undefined) {
          if (error.response.status === 401) {
            window.localStorage.setItem('showSesionExpirada', '1');
            window.localStorage.setItem('logout', '1');
            store.dispatch('logout');
            console.clear();
          }
        }
        return Promise.reject(error);
      }
    );
  }
}
