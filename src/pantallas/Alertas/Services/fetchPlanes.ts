import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type PlanBackend = {
  id: number;
  nombre: string;
};

type PlanHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (): AxiosPromise<PlanHttpResponseBody> => {
  return axios.http.get('Alerta/PlanMantencionList');
};

const getResponseData = (
  axiosResponse: AxiosResponse<PlanHttpResponseBody>
): PlanBackend[] => {
  try {
    const maybeCalendarios = axiosResponse.data;
    return maybeCalendarios instanceof Array ? maybeCalendarios : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValid = (plan: PlanBackend): Promise<PlanBackend | null> => {
  return schema
    .isValid(plan, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? plan : null));
};

const parsePlan = (x: PlanBackend): Plan => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchPlanes = (): Promise<Plan[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (planes): Promise<Array<PlanBackend | null>> =>
        Promise.all(planes.map(getMaybeValid))
    )
    .then(planes => planes.filter(x => x))
    .then(planes => planes.map(parsePlan));

export type Plan = {
  id: number;
  nombre: string;
};
