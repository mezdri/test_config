import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import {
  HistoricosCorrectivosList,
  HistoricoCorrectivo,
} from './HistoricoCorrectivo';

type HistoricoCorrectivoBackend = {
  mantHistoryVms: HistoricosCorrectivosList[];
  patente: string;
  costoTotalMantenimiento: number;
  costoTotalCorrectiva: number;
};

type CorrectivasHttpResponseBody = HistoricoCorrectivoBackend;
export type FetchCorrectivasHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idVehiculo: number
): AxiosPromise<CorrectivasHttpResponseBody> => {
  return axios.http.get(`MantenimientoCorrectivo/historico/${idVehiculo}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CorrectivasHttpResponseBody>
): HistoricoCorrectivoBackend => {
  try {
    const maybeCorrectivas = axiosResponse.data;
    return maybeCorrectivas;
  } catch {
    return;
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  pautaActividad: HistoricoCorrectivoBackend
): Promise<HistoricoCorrectivoBackend | null> => {
  return schema
    .isValid(pautaActividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pautaActividad : null));
};

const parseCorrectiva = (
  x: HistoricoCorrectivoBackend
): HistoricoCorrectivo => ({
  correctivosHistoricos: x.mantHistoryVms.map(q => ({
    id: q.id,
    nombre: q.nombre,
    fechaRealizacion: moment(q.fechaRealizacion),
  })),
  patente: x.patente,
  costoTotalCorrectiva: x.costoTotalCorrectiva,
  costoTotalMantenimientos: x.costoTotalMantenimiento,
});

export const fetchHistoricosCorrectivo = (idVehiculo: number) =>
  makeHttpRequest(idVehiculo)
    .then(getResponseData)
    .then(getMaybeValidRecepcion)
    .then(parseCorrectiva);
