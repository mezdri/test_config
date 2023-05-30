import { FuncionGlobal } from './Funciones';
import { number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

type FuncionGlobalBackend = {
  id: number;
  nombre: string;
  script: string;
  estado: string;
  fechaCreacion: string;
  fechaModificacion: string;
  usuarioCreador: string;
  usuarioModifica: string;
};

type ProveedoresGpsHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<ProveedoresGpsHttpResponseBody> =>
  axios.http.get('FuncionGlobal/Grid');

const getResponseData = (
  axiosResponse: AxiosResponse<ProveedoresGpsHttpResponseBody>
): FuncionGlobalBackend[] => {
  try {
    const maybeFuncionesGlobales = axiosResponse.data;
    return maybeFuncionesGlobales instanceof Array
      ? maybeFuncionesGlobales
      : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: number(),
  nombre: string().ensure(),
  script: string().ensure(),
  estado: string().ensure(),
});

const getMaybeValidFuncionGlobal = (
  funcionGlobal: FuncionGlobalBackend
): Promise<FuncionGlobalBackend | null> => {
  return schema
    .isValid(funcionGlobal, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? funcionGlobal : null));
};

const parseFuncionGlobal = (x: FuncionGlobalBackend): FuncionGlobal => ({
  id: x.id,
  script: x.script,
  nombre: x.nombre,
  estado: x.estado,
  fechaCreacion: makeNullableMoment(x.fechaCreacion),
  fechaModificacion: makeNullableMoment(x.fechaModificacion),
  usuarioCreador: x.usuarioCreador,
  usuarioModifica: x.usuarioModifica,
  estadoTxt: x.estado == '1' ? 'Activo' : 'Inactivo',
});

export const fetchFuncionesGlobales = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (funcionesGlobales): Promise<Array<FuncionGlobalBackend | null>> =>
        Promise.all(funcionesGlobales.map(getMaybeValidFuncionGlobal))
    )
    .then(funcionesGlobales => funcionesGlobales.filter(x => x))
    .then(funcionesGlobales => funcionesGlobales.map(parseFuncionGlobal));
