import { array, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import { CalendarioPlanMantenimiento } from './PlanMantenimiento';
import config from '@/config/index';

type CalendarioBackend = {
  id: CalendarioPlanMantenimiento['id'];
  nombreCalendario: CalendarioPlanMantenimiento['nombreCalendario'];
  estado: boolean;
  diaria?: boolean;
  semanaLaboral?: boolean;
  semanal?: boolean;
  mensual?: boolean;
  anual?: boolean;
  fechaInicio?: string;
  fechaFin?: string;
};

type CalendarioHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Calendario);

const makeHttpRequest = (): AxiosPromise<CalendarioHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`Calendario/grid2/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CalendarioHttpResponseBody>
): CalendarioBackend[] => {
  try {
    const maybeCalendarios = axiosResponse.data;
    return maybeCalendarios instanceof Array ? maybeCalendarios : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombreCalendario: string().ensure(),
});

const getMaybeValidCalendario = (
  calendario: CalendarioBackend
): Promise<CalendarioBackend | null> => {
  return schema
    .isValid(calendario, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? calendario : null));
};

const parseCalendario = (
  x: CalendarioBackend
): CalendarioPlanMantenimiento => ({
  id: x.id,
  nombreCalendario: x.nombreCalendario,
  fechaInicio: moment(x.fechaInicio),
  ...(x.fechaFin && {
    fechaFin: moment(x.fechaFin),
  }),
  ...(x.diaria && {
    frecuencia: 'Diaria',
  }),
  ...(x.semanal && {
    frecuencia: 'Semanal',
  }),
  ...(x.semanaLaboral && {
    frecuencia: 'Semanal Laboral',
  }),
  ...(x.mensual && {
    frecuencia: 'Mensual',
  }),
  ...(x.anual && {
    frecuencia: 'Anual',
  }),
});

export const fetchCalendarios = (): Promise<CalendarioPlanMantenimiento[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (calendarios): Promise<Array<CalendarioBackend | null>> =>
        Promise.all(calendarios.map(getMaybeValidCalendario))
    )
    .then(calendarios => calendarios.filter(x => x.estado))
    .then(calendarios => calendarios.map(parseCalendario));
