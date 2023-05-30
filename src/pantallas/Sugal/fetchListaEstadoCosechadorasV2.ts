import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

const axios = new AxiosVue(ServicioProxy.Sugal);
type HttpResponseBody = unknown;
const makeHttpRequest = (
  fechaHoraDesde: string,
  fechaHoraHasta: string
): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(
    `Sugal/GetListaEstadoCosechadorasV2/` +
      fechaHoraDesde +
      `/` +
      fechaHoraHasta
  );
};

export const fetchListaEstadoCosechadorasV2 = (
  fechaHoraDesde: string,
  fechaHoraHasta: string
) =>
  makeHttpRequest(fechaHoraDesde, fechaHoraHasta).catch(x => {
    // TODO sentry log
    console.error(x);
  });
