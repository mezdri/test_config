import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CorrectivaGrid } from '@/pantallas/Correctivas/Data/Correctiva';
import moment from 'moment';

type CorrectivaBackend = {
  id: number;
  nombre: string;
  unidad: string;
  flota: string;
  fechaModificacion: string;
  usuarioModificacion: string;
  fechaCreacion: string;
  usuarioCreacion: string;
  costoHH: number;
  costoInsum: number;
  estadoTxt: string;
};

type CorrectivaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<CorrectivaHttpResponseBody> => {
  return axios.http.get(`MantenimientoCorrectivo`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CorrectivaHttpResponseBody>
): CorrectivaBackend[] => {
  try {
    const maybeCorrectiva = axiosResponse.data;
    return maybeCorrectiva instanceof Array ? maybeCorrectiva : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  unidad: string().ensure(),
  costosInsum: string().ensure(),
  costosHH: string().ensure(),
  estado: string().ensure(),
  flota: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaCreacion: string().ensure(),
  ususarioCreacion: string().ensure(),
  estadoTxt: string().ensure(),
});

const getMaybeValidCorrectiva = (
  correctiva: CorrectivaBackend
): Promise<CorrectivaBackend | null> => {
  return schema
    .isValid(correctiva, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? correctiva : null));
};

const parseCorrectiva = (x: CorrectivaBackend): CorrectivaGrid => ({
  id: x.id,
  unidad: x.unidad,
  nombre: x.nombre,
  flota: x.flota,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModificacion: x.usuarioModificacion,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreacion: x.usuarioCreacion,
  costoHH: x.costoHH,
  costoInsum: x.costoInsum,
  estado: x.estadoTxt,
});

export const fetchCorrectivasGrid = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Correctiva): Promise<Array<CorrectivaBackend | null>> =>
        Promise.all(Correctiva.map(getMaybeValidCorrectiva))
    )
    .then(Correctiva => Correctiva.filter(x => x))
    .then(Correctiva => Correctiva.map(parseCorrectiva));
