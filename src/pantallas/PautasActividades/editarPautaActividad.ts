import { PautaActividadesMantenimiento } from '@/pantallas/ActividadesMantenimiento/ActividadMantenimiento';
import { BooleanAsNumber } from '@/reusable/Data/dataUtils';
import {
  PautaActividadNueva,
  PautaActividadAsociacion,
} from './PautaActividad';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PautasPlanesMantenimiento } from '../PlanesMantenimiento/Data/PlanMantenimiento';
import { omit } from 'lodash';

type EditarPautaActividadHttpResponseBody = unknown;
export type EditarPautaActividadHttpRequestParams = {
  id?: number;
  nombrePauta: string;
  descripcion: string;
  estado: number;
  actividadMants: PautaActividadesMantenimiento[];
  planMantenimientos: PautasPlanesMantenimiento[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  pautaActividad: PautaActividadAsociacion
): AxiosPromise<EditarPautaActividadHttpResponseBody> => {
  const params: EditarPautaActividadHttpRequestParams = {
    ...omit(pautaActividad, ['actividades', 'planes']),
    estado: pautaActividad.estado.id,
    actividadMants: pautaActividad.actividades,
    planMantenimientos: pautaActividad.planes,
  };
  return axios.http.put('PautaActividad', params);
};

export const editarPautaActividad = (
  pautaActividad: PautaActividadAsociacion
) => makeHttpRequest(pautaActividad);
