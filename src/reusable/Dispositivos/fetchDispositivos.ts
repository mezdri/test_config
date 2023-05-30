import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { DatoExtendido } from '@/pantallas/Dispositivos/Dispositivos';
import { Dispositivo } from './dispositivos';

type DispositivoBackend = {
  id: number;
  nombre: string;
  descripcion?: string;
  modelo: string;
  marca: string;
  tipoDispositivoId: number;
  tipoDispositivoText: string;
  icono: string;
  isGps: boolean;
  isGpsText: string;
  estado: number;
  estadoTxt: string;
  totalAsociados: number;
  totalAsociados2?: number;
  dispositivoCampoVm?: DatoExtendido[];
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
};

type DispositivoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (): AxiosPromise<DispositivoHttpResponseBody> => {
  return axios.http.get(`dispositivo/grid2/`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<DispositivoHttpResponseBody>
): DispositivoBackend[] => {
  try {
    const maybeDispositivo = axiosResponse.data;
    return maybeDispositivo instanceof Array ? maybeDispositivo : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  tipoDispositivoId: string().ensure(),
  marca: string().ensure(),
  modelo: string().ensure(),
  icono: string().ensure(),
  isGps: string().ensure(),
  isGpsText: string().ensure(),
  estado: string().ensure(),
  estadoTxt: string().ensure(),
  totalAsociados: string().ensure(),
  totalAsociados2: string().ensure(),
  datosExtendidos: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioCreador: string().ensure(),
  tipoDispositivoText: string().ensure(),
});

const getMaybeValidDisp = (
  Dispostivo: DispositivoBackend
): Promise<DispositivoBackend | null> => {
  return schema
    .isValid(Dispostivo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Dispostivo : null));
};

const parseDispositivo = (x: DispositivoBackend): Dispositivo => ({
  id: x.id,
  nombre: x.nombre,
  descripcion: x.descripcion,
  icono: x.icono,
  isGps: x.isGps,
  isGpsText: x.isGpsText,
  tipoDispositivoId: x.tipoDispositivoId,
  modelo: x.modelo,
  marca: x.marca,
  dispositivoCampoVm: x.dispositivoCampoVm,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreador: x.usuarioCreador,
  estado: x.estado,
  estadoTxt: x.estadoTxt,
  totalAsociados: x.totalAsociados,
  totalAsociados2: x.totalAsociados2,
  tipoDispositivoText: x.tipoDispositivoText,
});

export const fetchDispositivos = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Dispositivo): Promise<Array<DispositivoBackend | null>> =>
        Promise.all(Dispositivo.map(getMaybeValidDisp))
    )
    .then(Dispositivo => Dispositivo.filter(x => x))
    .then(Dispositivo => Dispositivo.map(parseDispositivo));
