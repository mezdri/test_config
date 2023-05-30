import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type VehiculoBackend = {
  id: number;
  unidad: string;
  referencia?: string;
  tipovehiculo?: string;
  modelo?: string;
  ano?: number;
};

type VehiculoRepsonse = {
  data: VehiculoBackend[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<VehiculoRepsonse> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`mantenimientopreventivo/vehiculos/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<VehiculoRepsonse>
): VehiculoRepsonse => axiosResponse.data;

const schema = object({
  id: string().ensure(),
  unidad: string().ensure(),
  referencia: string().ensure(),
  tipoVehiculo: string().ensure(),
  modelo: string().ensure(),
  ano: string().ensure(),
});

const getMaybeValidVehiculo = (
  vehiculo: VehiculoRepsonse
): Promise<VehiculoRepsonse | null> => {
  return schema
    .isValid(vehiculo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? vehiculo : null));
};

const parseVehiculo = (x: VehiculoBackend): Vehiculo => ({
  id: x.id,
  unidad: x.unidad,
  referencia: x.referencia,
  tipovehiculo: x.tipovehiculo,
  modelo: x.modelo,
  ano: x.ano,
});

export const fetchVehiculos = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(getMaybeValidVehiculo)
    .then(backendResponse => backendResponse.data.map(parseVehiculo));

export type Vehiculo = {
  id: number;
  unidad?: string;
  referencia?: string;
  tipovehiculo?: string;
  modelo?: string;
  ano?: number;
};
