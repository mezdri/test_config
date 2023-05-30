import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertaBackend } from '@/interfaces/Alertas';

type HttpResponseBody = AlertaBackend;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Alerta/GridClientSide');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertaBackend[] => {
  try {
    const maybeAlertas = axiosResponse.data;
    return maybeAlertas instanceof Array ? maybeAlertas : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  alertaBaseId: string().ensure(),
  alertaTipo: string().ensure(),
  color: string().ensure(),
  temporalidad: string().ensure(),
  cantidadEventos: string().ensure(),
  estadoTxt: string().ensure(),
  usuarioCreadorTxt: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacionTxt: string().ensure(),
  fechaModificacion: string().ensure(),
});

const getMaybeValidAlerta = (
  alertas: AlertaBackend
): Promise<AlertaBackend | null> => {
  return schema
    .isValid(alertas, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? alertas : null));
};

const parseAlerta = (x: AlertaBackend): AlertaBackend => ({
  id: x.id,
  nombre: x.nombre,
  alertaBaseId: x.alertaBaseId,
  alertaTipo: x.alertaTipo,
  color: x.color,
  temporalidad: x.temporalidad,
  eventos: x.eventos,
  estadoTxt: x.estadoTxt,
  usuarioCreadorTxt: x.usuarioCreadorTxt,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacionTxt: x.usuarioModificacionTxt,
  fechaModificacion: moment(x.fechaModificacion),
});

export const fetchAlertas = (): Promise<AlertaBackend[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (alertas): Promise<Array<any | null>> =>
        Promise.all(alertas.map(getMaybeValidAlerta))
    )
    .then(alertas => alertas.filter(x => x))
    .then(alertas => alertas.map(parseAlerta));
