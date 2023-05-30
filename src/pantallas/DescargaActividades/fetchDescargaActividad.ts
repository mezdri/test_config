import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  fetchProveedoresGps,
  ProveedorGps,
} from '@/reusable/proveedorGps/fetchProveedoresGps';
import {
  ClienteProveedorGps,
  fetchClientesProveedorGps,
} from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import {
  DescargaActividad,
  DescargaActividadParcial,
  DescargaActividadGrid,
} from '@/pantallas/DescargaActividades/DescargaActividad';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

type DescargaActividadHttpResponseBody = {
  flotas: { id: number; flotaId: number }[];
  etiquetas: { id: number; etiquetaId: number }[];
  vehiculos: { id: number; vehiculoId: number }[];
  dispositivos: { id: number; dispositivoId: number }[];
  actividadTipos: { id: number; actividadTipoId: number }[];
  campos: { id: number; campoId: number }[];
  id: number;
  clienteId: number;
  clienteProveedorId: number;
  proveedorId: number;
  usuario: string;
  password: string;
  fechaIni: string;
  fechaFin: string;
  maxPeticionesDia: number;
  maxPeticionesHora: number;
  maxRegistrosBloque: number;
  estado: 0 | 1 | 2 | 3 | 4 | 5;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string;
  fechaModificacion: string;
};

const axios = new AxiosVue(ServicioProxy.Integracion);
const makeHttpRequest = (
  descarga: DescargaActividadGrid
): AxiosPromise<DescargaActividadHttpResponseBody> => {
  return axios.http.get(`integracion/descarga/${descarga.id}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<DescargaActividadHttpResponseBody>
): DescargaActividadHttpResponseBody => axiosResponse.data;

const schema = object({
  flotas: array(object({ id: number(), flotaId: number() })),
  etiquetas: array(object({ id: number(), etiquetaId: number() })),
  vehiculos: array(object({ id: number(), vehiculoId: number() })),

  id: string().ensure(),
  proveedorId: string().ensure(),
  clienteProveedorId: string().ensure(),
  usuario: string().ensure(),
  password: string().ensure(),
  fechaIni: string().ensure(),
  fechaFin: string().ensure(),
});

const getMaybeValidData = (
  data: DescargaActividadHttpResponseBody
): Promise<DescargaActividadHttpResponseBody | null> => {
  return schema
    .isValid(data, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? data : null));
};

const parse = (
  descarga: DescargaActividadHttpResponseBody,
  proveedoresGps: ProveedorGps[],
  clientesProveedorGps: ClienteProveedorGps[]
): DescargaActividad => {
  const estado = (() => {
    switch (descarga.estado) {
      case 0:
        return { id: descarga.estado, nombre: 'Inactivo' };
      case 1:
        return { id: descarga.estado, nombre: 'Activo' };
      default:
        throw Error('Estado desconocido');
    }
  })();

  return {
    id: descarga.id,

    estado,
    proveedor: proveedoresGps.find(
      proveedor => proveedor.id === descarga.proveedorId
    ),
    clienteProveedor: clientesProveedorGps.find(
      proveedor => proveedor.id === descarga.clienteProveedorId
    ),
    usuario: descarga.usuario,
    password: descarga.password,
    fechaInicio: makeNullableMoment(descarga.fechaIni),
    fechaTermino: makeNullableMoment(descarga.fechaFin),
    maximoPeticionesDia: descarga.maxPeticionesDia,
    maximoPeticionesHora: descarga.maxPeticionesHora,
    maximoRegistrosBloque: descarga.maxRegistrosBloque,

    flotasId: descarga.flotas.map(x => x.flotaId),
    etiquetasId: descarga.etiquetas.map(x => x.etiquetaId),
    vehiculosId: descarga.vehiculos.map(x => x.vehiculoId),

    tiposActividadId: descarga.actividadTipos.map(x => x.actividadTipoId),
    dispositivosId: descarga.dispositivos.map(x => x.dispositivoId),
    camposId: descarga.campos.map(x => x.campoId),
    creacion: {
      fecha: makeNullableMoment(descarga.fechaCreacion),
      usuario: descarga.usuarioCreacion,
    },
    modificacion: {
      fecha: makeNullableMoment(descarga.fechaModificacion),
      usuario: descarga.usuarioModificacion,
    },
  };
};

export const fetchDescargaActividad = (descarga: DescargaActividadGrid) =>
  Promise.all([
    makeHttpRequest(descarga)
      .then(getResponseData)
      .then(getMaybeValidData),
    fetchProveedoresGps(),
    fetchClientesProveedorGps(),
  ]).then(([descarga, proveedoresGps, clientesProveedorGps]) =>
    parse(descarga, proveedoresGps, clientesProveedorGps)
  );
