import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearInformeoHttpResponseBody = unknown;
type DataInformeNuevo = {
  report_type: string;
  date_created: any;
  user: string;
  client?: string;
  starting_date: string;
  starting_hour: string;
  ending_date?: string;
  ending_hour: string;
  vehicles: number;
  hidden_columns?: any;
  trustworthy: boolean;
  activities_types_list: any;
  summary: boolean;
  day_grouping: boolean;
  zones: any;
  all_events: boolean;
  minimum_detention_time: number;
  maintenance_plans: any;
  speed_limit: number;
};

var axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  dataInforme: any,
  extension: string
): AxiosPromise<CrearInformeoHttpResponseBody> => {
  const params: DataInformeNuevo = {
    ...dataInforme,
  };
  switch (params.report_type) {
    case 'alertas': {
      // axios = new AxiosVue(ServicioProxy.Alerta);
      // return axios.http.post('Alerta/GetAlertaReporte/' + extension, params, {
      //   responseType: 'arraybuffer',
      // });
      return axios.http.post(
        'metabase/GeneraHistorico/' + extension + '/' + 1,
        params,
        {
          responseType: 'arraybuffer',
        }
      );
    }
    case 'sitios': {
      return axios.http.post(
        'metabase/GeneraHistorico/' + extension + '/' + 1,
        params,
        {
          responseType: 'arraybuffer',
        }
      );
    }
    case 'detalle_viaje': {
      return axios.http.post(
        'metabase/GeneraHistorico/' + extension + '/' + 1,
        params,
        {
          responseType: 'arraybuffer',
        }
      );
    }
    default: {
      return axios.http.post(
        'metabase/GeneraHistorico/' + extension + '/' + 0,
        params,
        {
          responseType: 'arraybuffer',
        }
      );
    }
  }
};

export const generarInformeHistorico = (
  dataInforme: any,
  tipoDescarga: string
) => makeHttpRequest(dataInforme, tipoDescarga).then();
