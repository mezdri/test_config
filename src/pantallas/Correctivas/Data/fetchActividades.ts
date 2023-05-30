import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type ActividadBackend = {
  id: number;
  nombreActividad: string;
  accion: string;
};

type ActividadResponse = {
  data: ActividadBackend[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<ActividadResponse> => {
  return axios.http.get(`mantenimientocorrectivo/actividades/`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<ActividadResponse>
): ActividadResponse => axiosResponse.data;

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  accion: string().ensure(),
});

const getMaybeValidActividad = (
  actividad: ActividadResponse
): Promise<ActividadResponse | null> => {
  return schema
    .isValid(actividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? actividad : null));
};

const parseActividad = (x: ActividadBackend): Actividad => ({
  id: x.id,
  nombreActividad: x.nombreActividad,
  accion: x.accion,
});

export const fetchActividades = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(getMaybeValidActividad)
    .then(backendResponse => backendResponse.data.map(parseActividad));

export type Actividad = {
  id: number;
  nombreActividad: string;
  accion: string;
};
