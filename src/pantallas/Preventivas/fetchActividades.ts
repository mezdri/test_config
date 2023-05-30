import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type ActividadBackend = {
  id: number;
  nombre: string;
  accion: string;
};

type ActividadResponse = {
  data: ActividadBackend[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (idPauta: number): AxiosPromise<ActividadResponse> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(
    `mantenimientopreventivo/actividades/${clienteId}/${idPauta}`
  );
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
  nombre: x.nombre,
  accion: x.accion,
});

export const fetchActividades = (idPauta: number) =>
  makeHttpRequest(idPauta)
    .then(getResponseData)
    .then(getMaybeValidActividad)
    .then(backendResponse => backendResponse.data.map(parseActividad));

export type Actividad = {
  id: number;
  nombre: string;
  accion: string;
};
