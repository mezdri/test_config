import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Variables } from './mensaje';

type VariablesBackend = {
  id: number;
  nombreVariable: string;
  nombreValor: string;
  nombreMostrar: string;
};

type MensajeHttpResponseBody = unknown;
const axios = new AxiosVue(ServicioProxy.Copiloto);
const makeHttpRequest = (): AxiosPromise<MensajeHttpResponseBody> => {
  return axios.http.get('MensajeCopiloto/getVariables');
};

const schema = object({
  id: string().ensure(),
  nombreVariable: string().ensure(),
  nombreValor: string().ensure(),
  nombreMostrar: string().ensure(),
});

const getMaybeValidMensaje = (
  Variables: VariablesBackend
): Promise<VariablesBackend | null> => {
  return schema
    .isValid(Variables, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Variables : null));
};

const getResponseData = (
  axiosResponse: AxiosResponse<MensajeHttpResponseBody>
): VariablesBackend[] => {
  try {
    const maybeMensaje = axiosResponse.data;
    return maybeMensaje instanceof Array ? maybeMensaje : [];
  } catch {
    return [];
  }
};

const parseMensaje = (x: VariablesBackend): Variables => ({
  id: x.id,
  nombreVariable: x.nombreVariable,
  nombreValor: x.nombreValor,
  nombreMostrar: x.nombreMostrar,
});

export const fetchVariables = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Mensaje): Promise<Array<VariablesBackend | null>> =>
        Promise.all(Mensaje.map(getMaybeValidMensaje))
    )
    .then(Mensaje => Mensaje.filter(x => x))
    .then(Mensaje => Mensaje.map(parseMensaje));
