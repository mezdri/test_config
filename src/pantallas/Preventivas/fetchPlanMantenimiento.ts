import { object, string, array } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type PlanMantenimientoBackend = {
  id: number;
  nombre: string;
};

type PlanMantenimientoResponse = {
  data: PlanMantenimientoBackend[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idVehiculo: number
): AxiosPromise<PlanMantenimientoResponse> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(
    `mantenimientopreventivo/planMantenimientos/${clienteId}/${idVehiculo}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<PlanMantenimientoResponse>
): PlanMantenimientoResponse => axiosResponse.data;

const schema = object({
  data: array(
    object({
      id: string().ensure(),
      nombre: string().ensure(),
    })
  ),
});

const getMaybeValidData = (
  plan: PlanMantenimientoResponse
): Promise<PlanMantenimientoResponse | null> => {
  return schema
    .isValid(plan, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? plan : null));
};

const parsePlan = (x: PlanMantenimientoBackend): PlanMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchPlanesMantenimiento = (idVehiculo: number) =>
  makeHttpRequest(idVehiculo)
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(backendResponse => backendResponse.data.map(parsePlan));

export type PlanMantenimiento = {
  id: number;
  nombre: string;
};
