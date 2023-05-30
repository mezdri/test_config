import { object, array, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import config from '@/config/index';
import { ServicioProxy, TipoFrecuenciasCalendario } from '@/config/enums';

type EnviarContactoHttpResponseBody = unknown;
export type EnviarContactoHttpRequestParams = {
  empresa?: string;
  mensaje?: string;
};

export type MsResponseData = {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
};

const axios = new AxiosVue(ServicioProxy.Metabase);

export type params = {
  request: request;
};
export type request = {
  empresa?: string;
  mensaje?: string;
  id_user?: string;
};

const makeHttpRequest = (
  empresa: string,
  mensaje: string,
  id_user: string
): AxiosPromise<MsResponseData> => {
  let params: params = {
    request: {
      empresa: empresa,
      mensaje: mensaje,
      id_user: id_user,
    },
  };
  return axios.http.post(`Metabase/PostgenericA/track/contactarEjecutivo`, {
    params: params.request,
  });
};

const getResponseData = (
  axiosResponse: AxiosResponse<MsResponseData>
): MsResponseData => {
  try {
    const x = axiosResponse.data;
    console.log(x);
    return x != undefined ? x : null;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidData = (data: MsResponseData): Promise<MsResponseData> => {
  return schema
    .isValid(data, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? data : null));
};

export const enviarContacto = (
  empresa: string,
  mensaje: string,
  id_user: string
) =>
  makeHttpRequest(empresa, mensaje, id_user)
    .then(getResponseData)
    .then(getMaybeValidData);
//.then(
//  (caso): MsResponseData | null =>
//    caso.map(getMaybeValidData)
//)

export type Comentario = {
  empresa?: string;
  comentario?: string;
};
