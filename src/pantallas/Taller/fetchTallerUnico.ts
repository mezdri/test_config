import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type TallerUnicoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  rut: string
): AxiosPromise<TallerUnicoHttpResponseBody> => {
  var query = '/ChequearNombreUnico/' + rut;
  return axios.http.get('TallerMant' + query);
};

export const fetchTallerUnico = (rut: string) => makeHttpRequest(rut);
