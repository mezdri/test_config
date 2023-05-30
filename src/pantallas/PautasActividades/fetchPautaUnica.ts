import { boolean } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type PautaUnica = boolean;

type PautaUnicaHttpResponseBody = PautaUnica;
export type FetchPautaUnicaHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  nombrePauta: string
): AxiosPromise<PautaUnicaHttpResponseBody> => {
  const body: FetchPautaUnicaHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get(
    `PautaActividad/ChequearNombreUnico/${body.clienteId}/${nombrePauta}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<PautaUnicaHttpResponseBody>
): PautaUnica => {
  try {
    const maybePautaUnica = axiosResponse.data;
    return maybePautaUnica;
  } catch {
    return;
  }
};

const schema = boolean();

const getMaybeValidRecepcion = (
  pautaUnica: PautaUnica
): Promise<PautaUnica | null> => {
  return schema
    .isValid(pautaUnica, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pautaUnica : null));
};

export const fetchPautaUnica = (nombrePauta: string) =>
  makeHttpRequest(nombrePauta)
    .then(getResponseData)
    .then(getMaybeValidRecepcion);
