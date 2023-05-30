import { object, string, array } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CalibracionVehiculo } from '../CalibracionVehiculo';

type HttpResponseBody = CalibracionVehiculo;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Calibracion/' + id);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): CalibracionVehiculo => {
  try {
    return axiosResponse.data;
  } catch {
    return null;
  }
};

const schema = object({
  id: string().ensure(),
  fecha: string().ensure(),
  odometro: string().ensure(),
  odometroPlataforma: string().ensure(),
  horasMotor: string().ensure(),
  horasMotorPlataforma: string().ensure(),
  vehiculoId: string().ensure(),
  estado: string().ensure(),
});

const getMaybeValid = (
  envio: CalibracionVehiculo
): Promise<CalibracionVehiculo | null> => {
  return schema
    .isValid(envio, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? envio : null));
};

const parseCalibracion = (x: CalibracionVehiculo): CalibracionVehiculo => ({
  id: x.id,
  fecha: moment(x.fecha),
  odometro: x.odometro,
  odometroPlataforma: x.odometroPlataforma,
  horasMotor: x.horasMotor,
  horasMotorPlataforma: x.horasMotorPlataforma,
  vehiculoId: x.vehiculoId,
  estado: x.estado,
});

export const fetchByIdCalibracion = (
  id: number
): Promise<CalibracionVehiculo> =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseCalibracion);
