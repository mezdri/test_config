import { object } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';

type HttpResponseBody = AlertasBaseBackend;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('AlertaBase/' + id + '/GetDetalle');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertasBaseBackend => {
  try {
    const maybeAlertas = axiosResponse.data;
    return maybeAlertas;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidAlerta = (
  alertas: AlertasBaseBackend
): Promise<AlertasBaseBackend | null> => {
  return schema
    .isValid(alertas, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? alertas : null));
};

const parseAlerta = (x: AlertasBaseBackend): AlertasBaseBackend => ({
  id: x.id,
  nombre: x.nombre,
  acumulable: x.acumulable,
  mensaje: x.mensaje,
  scriptActividad: x.scriptActividad,
  scriptActividadExt: x.scriptActividadExt,
  htmlBody: x.htmlBody,
  alertaBaseCodigoActividad: x.alertaBaseCodigoActividad,
  alertaBaseDispositivo: x.alertaBaseDispositivo,
  alertaCampoDinamico: x.alertaCampoDinamico,
  estado: x.estado,
  estadoTxt: x.estadoTxt,
});

export const fetchByIdAlertaBase = (id: number) =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValidAlerta)
    .then(parseAlerta);
