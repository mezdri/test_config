import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { typeActividad } from './ConfiguracionBase';

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('AlertaBase/GetTipoActividad');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): typeActividad[] => {
  try {
    //@ts-ignore
    const maybe = axiosResponse.data.value;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  tipoEvento: string().ensure(),
});

const getMaybeValid = (
  actividades: typeActividad
): Promise<typeActividad | null> => {
  return schema
    .isValid(actividades, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? actividades : null));
};

const parseActividad = (x: typeActividad): typeActividad => ({
  id: x.id,
  tipoEvento: x.tipoEvento,
});

export const fetchActividades = (): Promise<typeActividad[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (actividades): Promise<Array<typeActividad | null>> =>
        Promise.all(actividades.map(getMaybeValid))
    )
    .then(actividades => actividades.filter(x => x))
    .then(actividades => actividades.map(parseActividad));
