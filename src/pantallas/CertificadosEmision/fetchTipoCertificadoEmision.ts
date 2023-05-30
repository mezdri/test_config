import { object } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
type TipoCertificadoBackend = {
  id: number;
  nombre: string;
};

type CertificacdoEmisionHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<
  CertificacdoEmisionHttpResponseBody
> => {
  return axios.http.get(`CertificadoEmision/GetTipoCertificado`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CertificacdoEmisionHttpResponseBody>
): TipoCertificadoBackend[] => {
  try {
    const maybePautasActividades = axiosResponse.data;
    return maybePautasActividades instanceof Array
      ? maybePautasActividades
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  giro: TipoCertificadoBackend
): Promise<TipoCertificadoBackend | null> => {
  return schema
    .isValid(giro, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? giro : null));
};

const parseTipoCertificado = (x: TipoCertificadoBackend): TipoCertificado => ({
  id: x.id,
  nombre: x.nombre,
});

export type TipoCertificado = {
  id?: number;
  nombre?: string;
};

export const fetchTipoCertificado = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Certificado): Promise<Array<TipoCertificadoBackend | null>> =>
        Promise.all(Certificado.map(getMaybeValidRecepcion))
    )
    .then(Certificado => Certificado.filter(x => x))
    .then(Certificado => Certificado.map(parseTipoCertificado));
