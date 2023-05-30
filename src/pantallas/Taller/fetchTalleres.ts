import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Taller } from '@/pantallas/Taller/Taller';
import { EstadoEntidad } from '@/config/enums';

type TallerBackend = {
  id: number;
  rut: string;
  nombre: string;
  descripcion: string;
  giro: string;
  direccion: string;
  latitud: number;
  longitud: number;
  estado: EstadoEntidad;
  estadoTxt: string;
  usuarioCreacion: string;
  fechaCreacion: moment.Moment;
  usuarioModificacion: string;
  fechaModificacion: moment.Moment;
  totalAsociados: number;
};

type TallerHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<TallerHttpResponseBody> => {
  return axios.http.get('TallerMant');
};

const getResponseData = (
  axiosResponse: AxiosResponse<TallerHttpResponseBody>
): TallerBackend[] => {
  try {
    const maybeTaller = axiosResponse.data;
    return maybeTaller instanceof Array ? maybeTaller : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  rut: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  giro: string().ensure(),
  direccion: string().ensure(),
  latitud: string().ensure(),
  longitud: string().ensure(),
  estado: string().ensure(),
  estadoTxt: string().ensure(),
  usuarioCreacion: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacion: string().ensure(),
  total: string().ensure(),
});

const getMaybeValidTaller = (
  Taller: TallerBackend
): Promise<TallerBackend | null> => {
  return schema
    .isValid(Taller, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Taller : null));
};

const parseTaller = (x: TallerBackend): Taller => ({
  id: x.id,
  rut: x.rut,
  nombre: x.nombre,
  descripcion: x.descripcion,
  giro: x.giro,
  direccion: x.direccion === null ? '' : x.direccion,
  latitud: x.latitud,
  longitud: x.longitud,
  estado: x.estado,
  estadoTxt: x.estadoTxt,
  usuarioCreacion: x.usuarioCreacion,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacion: x.usuarioModificacion,
  fechaModificacion: moment(x.fechaModificacion),
  totalAsociados: x.totalAsociados,
});

export const fetchTalleres = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Taller): Promise<Array<TallerBackend | null>> =>
        Promise.all(Taller.map(getMaybeValidTaller))
    )
    .then(Taller => Taller.filter(x => x))
    .then(Taller => Taller.map(parseTaller));
