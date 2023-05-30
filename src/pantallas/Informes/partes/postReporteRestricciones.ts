import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';

type CrearInformeoHttpResponseBody = unknown;
type DataInformeNuevo = {
  report_type: string;
  vehicles: number;
  starting_date: string;
  starting_hour: string;
  ending_date?: string;
  ending_hour: string;
  summary: boolean;
  activities_types_list: any;
};

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  dataInforme: any,
  extension: string
): AxiosPromise<CrearInformeoHttpResponseBody> => {
  const params: DataInformeNuevo = {
    ...dataInforme,
  };

  
	return axios.http.post('metabase/ReporteRestriccion/' + extension, params);
  
	
  
};

export const postReporteRestricciones = (dataInforme: any, extension: string) =>
  makeHttpRequest(dataInforme, extension).then();
