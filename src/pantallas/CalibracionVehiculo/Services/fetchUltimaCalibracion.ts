import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { UltimaCalibracion } from '@/pantallas/CalibracionVehiculo/CalibracionVehiculo';

type HttpResponseBody = UltimaCalibracion;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idVehiculo: number,
  tipo: string,
  editar: boolean
): AxiosPromise<HttpResponseBody> => {
  var query = '?idVehiculo=' + idVehiculo;
  query += tipo == 'odometro' ? '&odometro=true' : '&odometro=false';
  query += editar ? '&penultimate=true' : '&penultimate=false';
  return axios.http.get('Calibracion/ultimaCalibracion' + query);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): UltimaCalibracion => {
  try {
    return axiosResponse.data;
  } catch {
    return null;
  }
};

const schema = object({
  fecha: string().ensure(),
  valor: string().ensure(),
});

const getMaybeValid = (
  calibracion: UltimaCalibracion
): Promise<UltimaCalibracion | null> => {
  return schema
    .isValid(calibracion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? calibracion : null));
};

const parseCalibracion = (x: UltimaCalibracion): UltimaCalibracion => ({
  fecha: moment(x.fecha),
  valor: x.valor,
});

export const fetchUltimaCalibracion = (
  idVehiculo: number,
  tipo: string,
  editar: boolean
): Promise<UltimaCalibracion> =>
  makeHttpRequest(idVehiculo, tipo, editar)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseCalibracion);
