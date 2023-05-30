import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type PautaActividadBackend = {
  id: number;
  nombre: string;
};

type PautaActividadResponse = {
  data: PautaActividadBackend[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idPlan: number,
  idVehiculo: number
): AxiosPromise<PautaActividadResponse> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(
    `mantenimientopreventivo/pautasactividades/${idPlan}/${idVehiculo}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<PautaActividadResponse>
): PautaActividadResponse => axiosResponse.data;

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValidPauta = (
  pauta: PautaActividadResponse
): Promise<PautaActividadResponse | null> => {
  return schema
    .isValid(pauta, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pauta : null));
};

const parsePauta = (x: PautaActividadBackend): PautaActividad => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchPautasActividad = (idPlan: number, idVehiculo: number) =>
  makeHttpRequest(idPlan, idVehiculo)
    .then(getResponseData)
    .then(getMaybeValidPauta)
    .then(backendResponse => backendResponse.data.map(parsePauta));
//

export type PautaActividad = {
  id: number;
  nombre: string;
};
