import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FirmasCertificadosBackend } from '@/pantallas/CertificadosBase/ConfiguracionBase';

type HttpResponseBody = FirmasCertificadosBackend;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('CertificadosBase/GetFirmasCertificado');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): FirmasCertificadosBackend[] => {
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

const getMaybeValidFirmas = (
  firmasCertificados: FirmasCertificadosBackend
): Promise<FirmasCertificadosBackend | null> => {
  return schema
    .isValid(firmasCertificados, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? firmasCertificados : null));
};

const parseFirmas = (
  x: FirmasCertificadosBackend
): FirmasCertificadosBackend => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchFirmasCertificados = (): Promise<
  FirmasCertificadosBackend[]
> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (tiposCertificados): Promise<Array<any | null>> =>
        Promise.all(tiposCertificados.map(getMaybeValidFirmas))
    )
    .then(firmasCertificados => firmasCertificados.filter(x => x))
    .then(firmasCertificados => firmasCertificados.map(parseFirmas));
