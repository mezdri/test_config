import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import {
  Calendario,
  CalendarioNuevoForm,
} from '@/pantallas/Calendarios/Calendario';

type CalendarioBackend = {
  id?: Calendario['id'];
  nombreCalendario: Calendario['nombreCalendario'];
  estado: Calendario['estado'];
  frecuenciasCalendario?: number;
  fechaInicio: Date;
  fechaInicioTxt?: string;
  fechaFinTxt?: string;
};

type CalendarioHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (): AxiosPromise<CalendarioHttpResponseBody> => {
  return axios.http.get('Calendario/GetCalendarios');
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
  estado: string().ensure(),
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

const parseCalendario = (x: CalendarioBackend): CalendarioNuevoForm => ({
  id: x.id,
  nombreCalendario: x.nombreCalendario,
  frecuenciaSeleccionada: x.frecuenciasCalendario,
  estado: x.estado,
  fechaInicio: moment(x.fechaInicio),
  fechaInicioTxt: x.fechaInicioTxt,
  fechaFinTxt: x.fechaFinTxt,
});

export const fetchCalendarios = (): Promise<CalendarioNuevoForm[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (calendarios): Promise<Array<CalendarioBackend | null>> =>
        Promise.all(calendarios.map(getMaybeValidCalendario))
    )
    .then(calendarios => calendarios.filter(x => x))
    .then(calendarios => calendarios.map(parseCalendario));
