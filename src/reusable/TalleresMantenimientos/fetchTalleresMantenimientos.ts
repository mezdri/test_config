import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TallerMantenimiento } from './talleresMantenimiento';

type TallerMantenimientoBackend = {
  id: number;
  nombre: string;
};

type TallerHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<TallerHttpResponseBody> => {
  return axios.http.get('TallerMant');
};

const getResponseData = (
  axiosResponse: AxiosResponse<TallerHttpResponseBody>
): TallerMantenimientoBackend[] => {
  try {
    const maybeTaller = axiosResponse.data;
    return maybeTaller instanceof Array ? maybeTaller : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValidTaller = (
  Taller: TallerMantenimientoBackend
): Promise<TallerMantenimientoBackend | null> => {
  return schema
    .isValid(Taller, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Taller : null));
};

const parseTaller = (x: TallerMantenimientoBackend): TallerMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchTalleresMantenimiento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Taller): Promise<Array<TallerMantenimientoBackend | null>> =>
        Promise.all(Taller.map(getMaybeValidTaller))
    )
    .then(Taller => Taller.filter(x => x))
    .then(Taller => Taller.map(parseTaller));
