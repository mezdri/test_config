import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type VehiculoBackend = {
  vehiculoId: number;
  unidad: string;
  etiqueta?: string;
  vehiculoMantenimientoId: string;
  flota?: string;
};

type VehiculoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<VehiculoHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(
    `MantenimientoPreventivoHistorico/VehiculoPlanMant/${clienteId}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<VehiculoHttpResponseBody>
): VehiculoBackend[] => {
  try {
    const maybeVehiculo = axiosResponse.data;
    return maybeVehiculo instanceof Array ? maybeVehiculo : [];
  } catch {
    return [];
  }
};

const schema = object({
  vehiculoId: string().ensure(),
  unidad: string().ensure(),
  etiqueta: string().ensure(),
  vehiculoMantenimientoId: string().ensure(),
  flota: string().ensure(),
});

const getMaybeValidVehiculo = (
  vehiculo: VehiculoBackend
): Promise<VehiculoBackend | null> => {
  return schema
    .isValid(vehiculo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? vehiculo : null));
};

const parseVehiculo = (x: VehiculoBackend): Vehiculo => ({
  vehiculoId: x.vehiculoId,
  id: x.vehiculoId,
  unidad: x.unidad,
  etiqueta: x.etiqueta,
  vehiculoMantenimientoId: x.vehiculoMantenimientoId,
  flota: x.flota,
});

export const fetchVehiculosHistorico = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Vehiculo): Promise<Array<VehiculoBackend | null>> =>
        Promise.all(Vehiculo.map(getMaybeValidVehiculo))
    )
    .then(Vehiculo => Vehiculo.filter(x => x))
    .then(Vehiculo => Vehiculo.map(parseVehiculo));

export type Vehiculo = {
  id?: number;
  vehiculoId: number;
  unidad: string;
  etiqueta?: string;
  vehiculoMantenimientoId: string;
  flota?: string;
};
