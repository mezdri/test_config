import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';
import config from '@/config/index';

var axios = new AxiosVue(ServicioProxy.Comercial);

type HttpResponseBody = unknown;

export const fetchFolio = (id: number) => makeHttpRequest(id).then();

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('FolioCertificado/GetFolioCertificado/' + id, {
    responseType: 'arraybuffer',
  });
};

// const makeHttpRequest = (
//     dataInforme: any,
//     tipoDescarga: string
//   ): AxiosPromise<CrearInformeoHttpResponseBody> => {
//     const params: DataInformeNuevo = {
//       ...dataInforme,
//     };
//     if(params.report_type == 'alertas'){
//       axios = new AxiosVue(ServicioProxy.Alerta);
//       return axios.http.post('Alerta/GetAlertaReporte/' + tipoDescarga, params, {responseType: 'arraybuffer'});
//     }else
//       return axios.http.post('metabase/ReportePdf/' + tipoDescarga, params, {responseType: 'arraybuffer'});

//   };

//   export const visualizarFolio = (dataInforme: any, tipoDescarga: string) =>
//     makeHttpRequest(dataInforme, tipoDescarga).then();
