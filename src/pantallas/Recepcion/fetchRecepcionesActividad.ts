import { number, object, string } from 'yup';
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
};

type RecepcionesHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);
const makeHttpRequest = (): AxiosPromise<RecepcionesHttpResponseBody> => {
  return axios.http.get('integracion/recepciones');
};

const getResponseData = (
  axiosResponse: AxiosResponse<RecepcionesHttpResponseBody>
): RecepcionActividadBackend[] => {
  try {
    const maybeRecepciones = axiosResponse.data;
    return maybeRecepciones instanceof Array ? maybeRecepciones : [];
  } catch {
    return [];
  }
};

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
  usuarioCreacion: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacion: string().ensure(),
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

const makeParser = (
  proveedoresGps: ProveedorGps[],
  clientesProveedorGps: ClienteProveedorGps[]
) => (recepcion: RecepcionActividadBackend): RecepcionActividad => {
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
    usuarioCreacion: recepcion.usuarioCreacion,
    fechaCreacion: makeNullableMoment(recepcion.fechaCreacion),
    usuarioModificacion: recepcion.usuarioModificacion,
    fechaModificacion: makeNullableMoment(recepcion.fechaModificacion),
    estadoTxt: recepcion.estadoTxt,
    estado,
    passwordOfuscado: '**********'.toString(),
    nombreProveedorText: proveedoresGps.find(
      proveedor => proveedor.id === recepcion.proveedorId
    ).nombre,
    nombreClienteProveedorText: clientesProveedorGps.find(
      proveedor => proveedor.id === recepcion.clienteProveedorId
    ).nombre,
  };
};

export const fetchRecepcionesActividad = () =>
  Promise.all([
    makeHttpRequest()
      .then(getResponseData)
      .then(
        (Recepciones): Promise<Array<RecepcionActividadBackend | null>> =>
          Promise.all(Recepciones.map(getMaybeValidRecepcion))
      )
      .then(recepciones => recepciones.filter(x => x)),
    fetchProveedoresGps(),
    fetchClientesProveedorGps(),
  ]).then(([recepciones, proveedoresGps, clientesProveedorGps]) =>
    recepciones.map(makeParser(proveedoresGps, clientesProveedorGps))
  );
