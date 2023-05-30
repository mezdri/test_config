import { array, number, object } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { DescargaActividadParcial } from '@/pantallas/DescargaActividades/DescargaActividad';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

type DescargaActividadBackend = {
  clienteProveedor: string;
  proveedor: string;
  estadoTxt: string;
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
const makeHttpRequest = (): AxiosPromise<DescargaActividadBackend[]> => {
  return axios.http.get('integracion/descarga');
};

const getResponseData = (
  axiosResponse: AxiosResponse<DescargaActividadBackend[]>
): DescargaActividadBackend[] => axiosResponse.data;

const schema = array(
  object({
    id: number(),
  })
);

const getMaybeValidData = (
  data: DescargaActividadBackend[]
): Promise<DescargaActividadBackend[]> => {
  return schema
    .isValid(data, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? data : null));
};

const parse = (
  descarga: DescargaActividadBackend
): DescargaActividadParcial => {
  return {
    id: descarga.id,
    proveedor: {
      id: descarga.proveedorId,
      nombre: descarga.proveedor,
    },
    clienteProveedor: {
      id: descarga.clienteProveedorId,
      nombre: descarga.clienteProveedor,
    },
    fechaInicio: makeNullableMoment(descarga.fechaIni),
    fechaTermino: makeNullableMoment(descarga.fechaFin),
    maximoPeticionesDia: descarga.maxPeticionesDia,
    maximoPeticionesHora: descarga.maxPeticionesHora,
    maximoRegistrosBloque: descarga.maxRegistrosBloque,
    estado: {
      id: descarga.estado,
      nombre: descarga.estadoTxt,
    },
    usuario: descarga.usuario,
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

export const fetchDescargasActividad = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(descargas => descargas.filter(x => x))
    .then(x => x.map(parse));
