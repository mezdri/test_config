import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type TallerBackend = {
  id: number;
  nombre: string;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<TallerBackend[]> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`mantenimientocorrectivo/talleres/`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<TallerBackend[]>
): TallerBackend[] => axiosResponse.data;

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValidPauta = (
  pauta: TallerBackend
): Promise<TallerBackend | null> => {
  return schema
    .isValid(pauta, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pauta : null));
};

const parsePauta = (x: TallerBackend): Taller => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchTalleres = () => makeHttpRequest().then(getResponseData);

export type Taller = {
  id: number;
  nombre: string;
};
