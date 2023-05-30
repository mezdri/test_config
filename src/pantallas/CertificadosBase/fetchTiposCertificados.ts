import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TiposCertificadosBackend } from '@/pantallas/CertificadosBase/ConfiguracionBase';

type HttpResponseBody = TiposCertificadosBackend;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('CertificadosBase/GetTipoCertificado');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): TiposCertificadosBackend[] => {
  try {
    const maybeTipos = axiosResponse.data;
    return maybeTipos instanceof Array ? maybeTipos : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValidTipos = (
  tiposCertificados: TiposCertificadosBackend
): Promise<TiposCertificadosBackend | null> => {
  return schema
    .isValid(tiposCertificados, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tiposCertificados : null));
};

const parseTipos = (x: TiposCertificadosBackend): TiposCertificadosBackend => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchTiposCertificados = (): Promise<TiposCertificadosBackend[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (tiposCertificados): Promise<Array<any | null>> =>
        Promise.all(tiposCertificados.map(getMaybeValidTipos))
    )
    .then(tiposCertificados => tiposCertificados.filter(x => x))
    .then(tiposCertificados => tiposCertificados.map(parseTipos));
