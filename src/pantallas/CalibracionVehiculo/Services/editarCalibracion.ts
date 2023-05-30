import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CalibracionVehiculo } from '@/pantallas/CalibracionVehiculo/CalibracionVehiculo';
import moment from 'moment';

type EditHttpResponseBody = unknown;
type HttpRequestBody = {
  vehiculoId: number;
  unidadVehiculo: string;
  fecha: string;
  estado: number;
  odometroPlataforma?: number;
  horasMotorPlataforma?: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  calibracionVehiculo: CalibracionVehiculo
): AxiosPromise<EditHttpResponseBody> => {
  const body: HttpRequestBody = {
    vehiculoId: calibracionVehiculo.vehiculoId,
    unidadVehiculo: calibracionVehiculo.unidadVehiculo,
    fecha: moment(calibracionVehiculo.fecha).format(),
    estado: calibracionVehiculo.estado,
    odometroPlataforma: calibracionVehiculo.odometroPlataforma,
    horasMotorPlataforma: calibracionVehiculo.horasMotorPlataforma,
  };
  return axios.http.put('Calibracion', body);
};

export const editarCalibracion = (calibracionVehiculo: CalibracionVehiculo) =>
  makeHttpRequest(calibracionVehiculo);
