import { number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { memoize } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';

type ClienteProveedorGpsBackend = {
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
  proveedorVm?: Proveedor[];
  proveedorId: number[];
};

type ClientesProveedorGpsHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<
  ClientesProveedorGpsHttpResponseBody
> => axios.http.get('clienteProveedor/grid2');

const getResponseData = (
  axiosResponse: AxiosResponse<ClientesProveedorGpsHttpResponseBody>
): ClienteProveedorGpsBackend[] => {
  try {
    const maybeClientesProveedorGps = axiosResponse.data;
    return maybeClientesProveedorGps instanceof Array
      ? maybeClientesProveedorGps
      : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: number(),
  nombre: string().ensure(),
});

const getMaybeValidClienteProveedorGps = (
  clienteProveedorGps: ClienteProveedorGpsBackend
): Promise<ClienteProveedorGpsBackend | null> => {
  return schema
    .isValid(clienteProveedorGps, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? clienteProveedorGps : null));
};

export type ClienteProveedorGps = {
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
  proveedorVm?: Proveedor[];
  proveedoresId: number[];
};

const parseClienteProveedorGps = (
  x: ClienteProveedorGpsBackend
): ClienteProveedorGps => ({
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
  proveedorVm: x.proveedorVm,
  proveedoresId: x.proveedorId,
});

export const fetch = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (
        clientesProveedorGps
      ): Promise<Array<ClienteProveedorGpsBackend | null>> =>
        Promise.all(clientesProveedorGps.map(getMaybeValidClienteProveedorGps))
    )
    .then(clientes => clientes.filter(x => x))
    .then(clientes => clientes.map(parseClienteProveedorGps));

const memoizedFetch = memoize(fetch, (...args) => args.join(','));

export const fetchClientesProveedorGps = memoizedFetch;
