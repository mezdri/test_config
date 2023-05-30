import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type TipoInformeBackend = {
  id?: number;
  nombre?: string;
  nombreServicio?: string;
};

export type TipoInforme = {
  id?: number;
  nombre?: string;
  nombreServicio?: string;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('InformeFiltros');
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
  nombre: string().ensure(),
  nombreServicio: string().ensure(),
});

const getMaybeValidTipoInforme = (
  tipoInforme: TipoInformeBackend
): Promise<TipoInformeBackend | null> => {
  let clienteId: number = config.getClienteSesion();
  if (
    clienteId != 16414 &&
    tipoInforme.nombreServicio == 'consolidado_mensual'
  ) {
    return null;
  }
  if (
    clienteId != 3798 &&
    tipoInforme.nombreServicio == 'consolidado_pelambres'
  ) {
    return null;
  }
  // if (
  //   clienteId != 3798 &&
  //   tipoInforme.nombreServicio == 'estado_transmision'
  // ) {
  //   return null;
  // }
  return schema
    .isValid(tipoInforme, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoInforme : null));
};

const parseTipoInforme = (x: TipoInformeBackend): TipoInforme => ({
  id: x.id,
  nombre: x.nombre,
  nombreServicio: x.nombreServicio,
});

export const fetchTipoInformeProgramacion = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoInforme): Promise<Array<TipoInformeBackend | null>> =>
        Promise.all(TipoInforme.map(getMaybeValidTipoInforme))
    )
    .then(TipoInforme => TipoInforme.filter(x => x))
    .then(TipoInforme => TipoInforme.map(parseTipoInforme));
