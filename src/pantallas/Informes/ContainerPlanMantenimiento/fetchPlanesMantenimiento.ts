import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';

type PlanMantenimientoBackend = {
  id?: number;
  nombre: string;
  estado: string;
};
type PlanMantenimiento = {
  id?: number;
  nombre: string;
  estado: string;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get(
    'mantenimientopreventivo/PlanMantenimientoFromMantenimiento'
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): PlanMantenimientoBackend[] => {
  try {
    const tipos = axiosResponse.data;
    return tipos instanceof Array ? tipos : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  descripcion: string().ensure(),
});

const getMaybeValidPlanMantenimiento = (
  planMantenimiento: PlanMantenimientoBackend
): Promise<PlanMantenimientoBackend | null> => {
  return schema
    .isValid(planMantenimiento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? planMantenimiento : null));
};

const parsePlanMantenimiento = (
  x: PlanMantenimientoBackend
): PlanMantenimiento => ({
  id: x.id,
  estado: x.estado,
  nombre: x.nombre,
});

export const fetchPlanMantenimiento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (PlanMantenimiento): Promise<Array<PlanMantenimientoBackend | null>> =>
        Promise.all(PlanMantenimiento.map(getMaybeValidPlanMantenimiento))
    )
    .then(PlanMantenimiento => PlanMantenimiento.filter(x => x))
    .then(PlanMantenimiento => PlanMantenimiento.map(parsePlanMantenimiento));
