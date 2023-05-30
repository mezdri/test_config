import { fetchActividadMantenimiento } from './../ActividadesMantenimiento/fetchActividadesMantenimiento';
import {
  PautaActividadDetalleBackend,
  fetchPautasActividadesDetalle,
} from './fetchPautasActividadesDetalle';
import { PautaActividadDetalle, PautaActividades } from './PautaActividad';
import { ActividadMantenimiento } from './../ActividadesMantenimiento/ActividadMantenimiento';
import { object } from 'yup';
import { TipoActividadesMantenimiento } from '@/config/enums';

type PautasActividadesHttpResponseBody = PautaActividadDetalleBackend;
export type FetchPautasActividadesHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
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
const parsePautaActividad = ([
  pautaActividadDetalle,
  actividadesMantenimiento,
]: [PautaActividadDetalle, ActividadMantenimiento[]]): PautaActividades[] => {
  return pautaActividadDetalle.actividades.map(x => ({
    ...x,
    tipo: { id: x.tipoActividadMant, nombre: getTipoById(x.tipoActividadMant) },
  }));
};

export const fetchActividadesPauta = (idPauta: number) =>
  Promise.all([
    fetchPautasActividadesDetalle(idPauta),
    fetchActividadMantenimiento(),
  ]).then(parsePautaActividad);
