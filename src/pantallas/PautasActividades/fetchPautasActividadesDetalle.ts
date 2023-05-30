import { PautasPlanesMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { PautaActividadDetalle } from './PautaActividad';
import { PautaActividadesMantenimiento } from './../ActividadesMantenimiento/ActividadMantenimiento';
import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import {
  ServicioProxy,
  TipoActividadesMantenimiento,
  TipoFrecuencias,
} from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type PautaActividadDetalleBackend = {
  id: number;
  nombrePauta: string;
  descripcion: string;
  estado: number;
  actividadMants: PautaActividadesMantenimiento[];
  planMantenimientos: PautasPlanesMantenimiento[];
  existeUnicaPlanMant?: boolean;
  existeMant?: boolean;
};

type PautasActividadesHttpResponseBody = PautaActividadDetalleBackend;
export type FetchPautasActividadesHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idPauta: number
): AxiosPromise<PautasActividadesHttpResponseBody> => {
  const body: FetchPautasActividadesHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get(`PautaActividad/${idPauta}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<PautasActividadesHttpResponseBody>
): PautaActividadDetalleBackend => {
  try {
    const maybePautasActividades = axiosResponse.data;
    return maybePautasActividades;
  } catch {
    return;
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  pautaActividad: PautaActividadDetalleBackend
): Promise<PautaActividadDetalleBackend | null> => {
  return schema
    .isValid(pautaActividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pautaActividad : null));
};

const getTipoById = (id: number) => {
  switch (id) {
    case TipoActividadesMantenimiento.Cambiar:
      return 'Cambiar';
    case TipoActividadesMantenimiento.Realizar:
      return 'Realizar';
    case TipoActividadesMantenimiento.Inspeccionar:
      return 'Inspeccionar';
    default:
      return 'Cambiar';
  }
};

const getFrecuenciaById = (id: number) => {
  switch (id) {
    case TipoFrecuencias.Dias:
      return 'Días';
    case TipoFrecuencias.Semanas:
      return 'Semanas';
    case TipoFrecuencias.Meses:
      return 'Meses';
    default:
      return 'Días';
  }
};

const parsePautaActividad = (
  x: PautaActividadDetalleBackend
): PautaActividadDetalle => ({
  id: x.id,
  nombrePauta: x.nombrePauta,
  descripcion: x.descripcion,
  estado: x.estado === 1,
  existeUnicaPlanMant: x.existeUnicaPlanMant,
  existeMant: x.existeMant,
  actividades: x.actividadMants.map(actividad => ({
    ...actividad,
    tipoActividadMantNombre: getTipoById(actividad.tipoActividadMant),
    nombreActividad: actividad.nombre,
  })),
  planesMantenimiento: x.planMantenimientos.map(plan => ({
    ...plan,
    frecuenciaTipoNombre: getFrecuenciaById(plan.tipoFrecuencia),
  })),
});

export const fetchPautasActividadesDetalle = (idPauta: number) =>
  makeHttpRequest(idPauta)
    .then(getResponseData)
    .then(getMaybeValidRecepcion)
    .then(parsePautaActividad);
