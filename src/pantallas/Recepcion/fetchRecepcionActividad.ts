import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { RecepcionActividad } from '@/pantallas/Recepcion/RecepcionActividad';
import {
  fetchProveedoresGps,
  ProveedorGps,
} from '@/reusable/proveedorGps/fetchProveedoresGps';
import {
  ClienteProveedorGps,
  fetchClientesProveedorGps,
} from '@/reusable/proveedorGps/fetchClientesProveedorGps';
import {
  makeNullableDuration,
  makeNullableMoment,
} from '@/reusable/Data/dataUtils';

type RecepcionActividadBackend = {
  usuarioModificacion: string;
  estadoTxt: string;
  usuarioCreacion: string;
  fechaModificacionTxt: string;
  fechaCreacionTxt: string;
  id: number;
  clienteId: number;
  clienteProveedorId: number;
  proveedorId: number;
  usuario: string;
  password: string;
  fechaIni: string;
  fechaFin: string;
  tiempoMinimo: number;
  cantidadBloque: number;
  estado: 0 | 1 | 2 | 3 | 4 | 5;
  fechaCreacion: string;
  fechaModificacion: string;
  flotas: { flotaId: number }[];
  etiquetas: { etiquetaId: number }[];
  vehiculos: { vehiculoId: number }[];
};

type RecepcionesHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);
const makeHttpRequest = (
  recepcionActividad: RecepcionActividad
): AxiosPromise<RecepcionesHttpResponseBody> => {
  return axios.http.get(`integracion/recepciones/${recepcionActividad.id}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<RecepcionesHttpResponseBody>
): RecepcionesHttpResponseBody => axiosResponse.data;

const schema = object({
  id: string().ensure(),
  proveedorId: string().ensure(),
  clienteProveedorId: string().ensure(),
  usuario: string().ensure(),
  password: string().ensure(),
  fechaIni: string().ensure(),
  fechaFin: string().ensure(),
  tiempoMinimo: number(),
  cantidadBloque: number(),
  flotas: array(object({ flotaId: number() })),
  etiquetas: array(object({ etiquetaId: number() })),
  vehiculos: array(object({ vehiculoId: number() })),
});

const getMaybeValidRecepcion = (
  recepcion: RecepcionActividadBackend
): Promise<RecepcionActividadBackend | null> => {
  return schema
    .isValid(recepcion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? recepcion : null));
};

export interface RecepcionActividadDetalle extends RecepcionActividad {
  flotasId: number[];
  etiquetasId: number[];
  vehiculosId: number[];
}

const makeParser = (
  recepcion: RecepcionActividadBackend,
  proveedoresGps: ProveedorGps[],
  clientesProveedorGps: ClienteProveedorGps[]
): RecepcionActividadDetalle => {
  const estado = (() => {
    switch (recepcion.estado) {
      case 0:
        return { id: recepcion.estado, nombre: 'Inactivo' };
      case 1:
        return { id: recepcion.estado, nombre: 'Activo' };
      default:
        throw Error('Estado desconocido');
    }
  })();

  return {
    id: recepcion.id,
    proveedor: proveedoresGps.find(
      proveedor => proveedor.id === recepcion.proveedorId
    ),
    clienteProveedor: clientesProveedorGps.find(
      proveedor => proveedor.id === recepcion.clienteProveedorId
    ),
    login: recepcion.usuario,
    password: recepcion.password,
    fechaInicio: makeNullableMoment(recepcion.fechaIni),
    fechaTermino: makeNullableMoment(recepcion.fechaFin),
    intervaloTransmiciones: recepcion.tiempoMinimo,
    numeroRegistrosPorBloque: recepcion.cantidadBloque,
    estado,
    flotasId: recepcion.flotas.map(x => x.flotaId),
    etiquetasId: recepcion.etiquetas.map(x => x.etiquetaId),
    vehiculosId: recepcion.vehiculos.map(x => x.vehiculoId),
    usuarioCreacion: recepcion.usuarioCreacion,
    fechaCreacion: makeNullableMoment(recepcion.fechaCreacion),
    usuarioModificacion: recepcion.usuarioModificacion,
    fechaModificacion: makeNullableMoment(recepcion.fechaModificacion),
    estadoTxt: recepcion.estadoTxt,
  };
};

export const fetchRecepcionActividad = (
  recepcionActividad: RecepcionActividad
) =>
  Promise.all([
    makeHttpRequest(recepcionActividad)
      .then(getResponseData)
      .then(recepcion =>
        getMaybeValidRecepcion(recepcion as RecepcionActividadBackend)
      ),
    fetchProveedoresGps(),
    fetchClientesProveedorGps(),
  ]).then(([recepcion, proveedoresGps, clientesProveedorGps]) =>
    makeParser(recepcion, proveedoresGps, clientesProveedorGps)
  );
