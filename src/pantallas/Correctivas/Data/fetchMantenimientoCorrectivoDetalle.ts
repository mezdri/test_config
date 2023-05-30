import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import moment from 'moment';
import { ActividadesCorrectivas } from './Correctiva';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';

export type CorrectivasBackend = {
  id: number;
  nombre: string;
  totalAsociados: number;
  vehiculoId: number;
  tallerId: number;
  responsable: number;
  fechaIngreso: string;
  fechaSalida: string;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  actividadMants: ActividadesCorrectivas[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
};

type CorrectivasHttpResponseBody = CorrectivasBackend;
export type FetchCorrectivasHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idMantenimiento: number
): AxiosPromise<CorrectivasHttpResponseBody> => {
  const body: FetchCorrectivasHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get(`MantenimientoCorrectivo/${idMantenimiento}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CorrectivasHttpResponseBody>
): CorrectivasBackend => {
  try {
    const maybeCorrectivas = axiosResponse.data;
    return maybeCorrectivas;
  } catch {
    return;
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  pautaActividad: CorrectivasBackend
): Promise<CorrectivasBackend | null> => {
  return schema
    .isValid(pautaActividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pautaActividad : null));
};

const parseCorrectiva = (x: CorrectivasBackend): Correctiva => ({
  id: x.id,
  taller: x.tallerId,
  fechaIngreso: moment(x.fechaIngreso),
  fechaSalida: moment(x.fechaSalida),
  fechaRealizacion: moment(x.fechaRealizacion),
  kilometraje: x.kilometraje,
  horasMotor: x.horasMotor,
  responsable: x.responsable,
  actividadesExtras: x.actividadeExtras,
  horasHombre: x.horasHombre,
  costoHoraHombre: x.costoHH,
  costoInsumos: x.costoInsum,
  vehiculoId: x.vehiculoId,
  actividades: x.actividadMants,
  nombre: x.nombre,
});

export const fetchMantenimientoCorrectivoDetalle = (idMantenimiento: number) =>
  makeHttpRequest(idMantenimiento)
    .then(getResponseData)
    .then(getMaybeValidRecepcion)
    .then(parseCorrectiva);
