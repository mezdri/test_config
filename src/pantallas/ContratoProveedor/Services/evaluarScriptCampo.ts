import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  ScriptValidacionCampos,
  EvaluacionScriptResponse,
  Evaluaciones,
} from '@/interfaces/ContratoProveedor';

type HttpResponseBody = EvaluacionScriptResponse;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  scriptValidacionBody: ScriptValidacionCampos
): AxiosPromise<HttpResponseBody> => {
  return axios.http.post(
    'Integracion/EvaluacionScript/Campo',
    scriptValidacionBody
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): Evaluaciones[] => {
  try {
    const maybe = axiosResponse.data.evaluaciones;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
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

export const evaluarScriptCampo = (
  scriptValidacionBody: ScriptValidacionCampos
): Promise<Evaluaciones[]> =>
  makeHttpRequest(scriptValidacionBody)
    .then(getResponseData)
    .then((c): Promise<Array<any | null>> => Promise.all(c.map(getMaybeValid)))
    .then(c => c.filter(x => x))
    .then(c => c.map(parseEvaluaciones));
