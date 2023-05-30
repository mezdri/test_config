import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';
import config from '@/config/index';

type TipoInformeBackend = {
  id?: number;
  descripcion?: string;
};
export type TipoInforme = {
  id?: number;
  descripcion?: string;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Reporte);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('Reporte/TipoInforme');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): TipoInformeBackend[] => {
  try {
    const tipos = axiosResponse.data;
    return tipos instanceof Array ? tipos : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  descripcion: string().ensure(),
});

const getMaybeValidTipoInforme = (
  tipoInforme: TipoInformeBackend
): Promise<TipoInformeBackend | null> => {
  let clienteId: number = config.getClienteSesion();
  // Perfilación cliente
  if (clienteId != 16414 && tipoInforme.id == 16) {
    return null;
  }
  if (clienteId != 3798 && tipoInforme.id == 20) {
    return null;
  }
  if (clienteId != 2892 && tipoInforme.id == 21) {
    return null;
  }
  if (clienteId != 3833 && (tipoInforme.id == 24 || tipoInforme.id == 25)) {
    return null;
  }
  return schema
    .isValid(tipoInforme, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoInforme : null));
};

const parseTipoInforme = (x: TipoInformeBackend): TipoInforme => ({
  id: x.id,
  descripcion: x.descripcion,
});

export const fetchTipoInforme = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoInforme): Promise<Array<TipoInformeBackend | null>> =>
        Promise.all(TipoInforme.map(getMaybeValidTipoInforme))
    )
    .then(TipoInforme => TipoInforme.filter(x => x))
    .then(TipoInforme => TipoInforme.map(parseTipoInforme));
