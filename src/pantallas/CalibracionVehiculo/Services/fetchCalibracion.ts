import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CalibracionVehiculo } from '@/pantallas/CalibracionVehiculo/CalibracionVehiculo';

type CalibracionHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  tipo: string
): AxiosPromise<CalibracionHttpResponseBody> => {
  var query = tipo == 'odometro' ? '?odometro=true' : '?odometro=false';
  return axios.http.get('Calibracion' + query);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CalibracionHttpResponseBody>
): CalibracionVehiculo[] => {
  try {
    const maybeCalibracion = axiosResponse.data;
    return maybeCalibracion instanceof Array ? maybeCalibracion : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  unidadVehiculo: string().ensure(),
  fecha: string().ensure(),
  odometro: string().ensure(),
  odometroPlataforma: string().ensure(),
  horasMotor: string().ensure(),
  horasMotorPlataforma: string().ensure(),
  vehiculoId: string().ensure(),
  usuarioCreador: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacion: string().ensure(),
  estado: string().ensure(),
  fechaCreacionTxt: string().ensure(),
  fechaModificacionTxt: string().ensure(),
});

const getMaybeValidCalibracion = (
  Calibracion: CalibracionVehiculo
): Promise<CalibracionVehiculo | null> => {
  return schema
    .isValid(Calibracion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Calibracion : null));
};

const parseCalibracion = (x: CalibracionVehiculo): CalibracionVehiculo => ({
  id: x.id,
  unidadVehiculo: x.unidadVehiculo,
  fecha: moment(x.fecha),
  odometro: x.odometro,
  odometroPlataforma: x.odometroPlataforma,
  horasMotor: x.horasMotor,
  horasMotorPlataforma: x.horasMotorPlataforma,
  vehiculoId: x.vehiculoId,
  usuarioCreador: x.usuarioCreador === null ? '' : x.usuarioCreador,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaModificacion: moment(x.fechaModificacion),
  estado: x.estado,
  fechaCreacionTxt: x.fechaCreacionTxt,
  fechaModificacionTxt: x.fechaModificacionTxt,
});

export const fetchCalibracion = (tipo: string) =>
  makeHttpRequest(tipo)
    .then(getResponseData)
    .then(
      (c): Promise<Array<CalibracionVehiculo | null>> =>
        Promise.all(c.map(getMaybeValidCalibracion))
    )
    .then(c => c.filter(x => x))
    .then(c => c.map(parseCalibracion));
