import { AxiosPromise, AxiosResponse } from 'axios';
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
  semaforo: any;
};

var axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  dataInforme: any,
  tipoDescarga: string
): AxiosPromise<CrearInformeoHttpResponseBody> => {
  const params: DataInformeNuevo = {
    ...dataInforme,
  };
  return axios.http.post('metabase/CrearInforme/' + tipoDescarga, params, {
    responseType: 'arraybuffer',
  });
};

export const generarInforme = (dataInforme: any, tipoDescarga: string) =>
  makeHttpRequest(dataInforme, tipoDescarga).then();
