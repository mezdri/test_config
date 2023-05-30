import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';

type HttpResponseBody = AlertasBaseBackend;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('AlertaBase/GridClientSide');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertasBaseBackend[] => {
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
  usuarioCreadorTxt: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacionTxt: string().ensure(),
  fechaModificacion: string().ensure(),
});

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
  usuarioCreadorTxt: x.usuarioCreadorTxt,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacionTxt: x.usuarioModificacionTxt,
  fechaModificacion: moment(x.fechaModificacion),
});

export const fetchAlertasBaseGrid = (): Promise<AlertasBaseBackend[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (alertas): Promise<Array<any | null>> =>
        Promise.all(alertas.map(getMaybeValidAlerta))
    )
    .then(alertas => alertas.filter(x => x))
    .then(alertas => alertas.map(parseAlerta));
