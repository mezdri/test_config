import { number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { memoize } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import { Giro } from '@/pantallas/Proveedor/Giro';
import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';

type ProveedorGpsBackend = {
  id: number;
  rut: string;
  nombre: string;
  giroId: number;
  giroText: string;
  direccion: string;
  tecnicoNombre: string;
  tecnicoTelefono: string;
  tecnicoEmail: string;
  comercialNombre: string;
  comercialTelefono: string;
  comercialEmail: string;
  estado: number;
  usuarioCreadorId: number;
  usuarioModificacionId: number;
  estadoTxt: string;
  usuarioCreador: string;
  fechaCreacionTxt: string;
  usuarioModifica: string;
  fechaModificacionTxt: string;
  clienteProveedorVm?: ClienteProveedor[];
  clienteProveedorId?: number[];
};

type ProveedoresGpsHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<ProveedoresGpsHttpResponseBody> =>
  axios.http.get('Proveedor/grid2');

const getResponseData = (
  axiosResponse: AxiosResponse<ProveedoresGpsHttpResponseBody>
): ProveedorGpsBackend[] => {
  try {
    const maybeProveedoresGps = axiosResponse.data;
    return maybeProveedoresGps instanceof Array ? maybeProveedoresGps : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: number(),
  nombre: string().ensure(),
});

const getMaybeValidProveedorGps = (
  proveedorGps: ProveedorGpsBackend
): Promise<ProveedorGpsBackend | null> => {
  return schema
    .isValid(proveedorGps, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? proveedorGps : null));
};

export type ProveedorGps = {
  id?: number;
  rut?: string;
  nombre?: string;
  giroId?: number;
  giroText?: string;
  direccion?: string;
  tecnicoNombre?: string;
  tecnicoTelefono?: string;
  tecnicoEmail?: string;
  comercialNombre?: string;
  comercialTelefono?: string;
  comercialEmail?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  estadoTxt?: string;
  usuarioCreador?: string;
  fechaCreacionTxt?: string;
  usuarioModifica?: string;
  fechaModificacionTxt?: string;
  clienteProveedorVm?: ClienteProveedor[];
  clienteProveedorId?: number[];
};

const parseProveedorGps = (x: ProveedorGpsBackend): ProveedorGps => ({
  id: x.id,
  rut: x.rut,
  nombre: x.nombre,
  giroId: x.giroId,
  giroText: x.giroText,
  direccion: x.direccion,
  tecnicoNombre: x.tecnicoNombre,
  tecnicoTelefono: x.tecnicoTelefono,
  tecnicoEmail: x.tecnicoEmail,
  comercialNombre: x.comercialNombre,
  comercialTelefono: x.comercialTelefono,
  comercialEmail: x.comercialEmail,
  estado: x.estado,
  usuarioCreadorId: x.usuarioCreadorId,
  usuarioModificacionId: x.usuarioModificacionId,
  estadoTxt: x.estadoTxt,
  usuarioCreador: x.usuarioCreador,
  fechaCreacionTxt: x.fechaCreacionTxt,
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaModificacionTxt: x.fechaModificacionTxt,
  clienteProveedorVm: x.clienteProveedorVm,
  clienteProveedorId: x.clienteProveedorId,
});

export const fetch = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (proveedoresGps): Promise<Array<ProveedorGpsBackend | null>> =>
        Promise.all(proveedoresGps.map(getMaybeValidProveedorGps))
    )
    .then(proveedoresGps => proveedoresGps.filter(x => x))
    .then(proveedoresGps => proveedoresGps.map(parseProveedorGps));

const memoizedFetch = memoize(fetch, (...args) => args.join(','));

export const fetchProveedoresGps = memoizedFetch;
