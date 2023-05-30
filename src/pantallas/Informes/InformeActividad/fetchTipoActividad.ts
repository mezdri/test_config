import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';

type TipoActividadBackend = {
  id?: number;
  tipoEvento?: string;
  imagen?: string;
  usuarioCreadorId?: number;
  fechaCreacion?: string;
  usuarioModificacionId?: number;
  fechaModificacion?: string;
  actividades?: string;
  descargaActividadTipo?: string;
};
export type TipoActividad = {
  id?: number;
  tipoEvento?: string;
  imagen?: string;
  usuarioCreadorId?: number;
  fechaCreacion?: string;
  usuarioModificacionId?: number;
  fechaModificacion?: string;
  actividades?: string;
  descargaActividadTipo?: string;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Reporte);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('Reporte/ActividadTipo');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): TipoActividadBackend[] => {
  try {
    const tipos = axiosResponse.data;
    return tipos instanceof Array ? tipos : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  descripcion: string().ensure(),
});

const getMaybeValidTipoActividad = (
  tipoActividad: TipoActividadBackend
): Promise<TipoActividadBackend | null> => {
  return schema
    .isValid(tipoActividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoActividad : null));
};

const parseTipoActividad = (x: TipoActividadBackend): TipoActividad => ({
  id: x.id,
  tipoEvento: x.tipoEvento,
  imagen: x.imagen,
  actividades: x.imagen,
  descargaActividadTipo: x.descargaActividadTipo,
  fechaCreacion: x.fechaCreacion,
  fechaModificacion: x.fechaModificacion,
  usuarioCreadorId: x.usuarioCreadorId,
  usuarioModificacionId: x.usuarioModificacionId,
});

export const fetchTipoActividad = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoActividad): Promise<Array<TipoActividadBackend | null>> =>
        Promise.all(TipoActividad.map(getMaybeValidTipoActividad))
    )
    .then(TipoActividad => TipoActividad.filter(x => x))
    .then(TipoActividad => TipoActividad.map(parseTipoActividad));
