import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PlanMantenimiento } from './PlanMantenimiento';

type DeletePlanMantenimientoHttpResponseBody = unknown;
export type DeletePlanMantenimientoHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  planMantenimiento: PlanMantenimiento
): AxiosPromise<DeletePlanMantenimientoHttpResponseBody> => {
  const params: DeletePlanMantenimientoHttpRequestParams = {
    id: planMantenimiento.id,
  };
  return axios.http.delete('PlanMantenimiento', { params });
};

export const eliminarPlanMantenimiento = (
  planMantenimiento: PlanMantenimiento
) => makeHttpRequest(planMantenimiento);
