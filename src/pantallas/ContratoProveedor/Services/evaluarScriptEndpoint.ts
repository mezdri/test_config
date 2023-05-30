import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  Evaluaciones,
  ScriptValidacionEndpoint,
} from '@/interfaces/ContratoProveedor';

type HttpResponseBody = Evaluaciones;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  scriptValidacion: ScriptValidacionEndpoint
): AxiosPromise<HttpResponseBody> => {
  return axios.http.post(
    'Integracion/EvaluacionScript/Endpoint',
    scriptValidacion
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): Evaluaciones => {
  try {
    return axiosResponse.data;
  } catch {
    return null;
  }
};

const schema = object({
  estado: string().ensure(),
  respuesta: string().ensure(),
});

const getMaybeValid = (
  evaluacion: Evaluaciones
): Promise<Evaluaciones | null> => {
  return schema
    .isValid(evaluacion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? evaluacion : null));
};

const parseEvaluaciones = (x: Evaluaciones): Evaluaciones => ({
  estado: x.estado,
  respuesta: x.respuesta,
});

export const evaluarScriptEndpoint = (
  scriptValidacion: ScriptValidacionEndpoint
): Promise<Evaluaciones> =>
  makeHttpRequest(scriptValidacion)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseEvaluaciones);
