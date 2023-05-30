import { ProgramacionesInformes } from './fetchProgamacionesInformes';

import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteHttpResponseBody = unknown;
export type DeleteHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  programacionInforme: ProgramacionesInformes
): AxiosPromise<DeleteHttpResponseBody> => {
  const params: DeleteHttpRequestParams = {
    id: programacionInforme.id,
  };
  return axios.http.delete('InformeProgramado', { params });
};

export const eliminarProgramacionInformes = (
  programacionInforme: ProgramacionesInformes
) => makeHttpRequest(programacionInforme);
