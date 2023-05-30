import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';

type HttpResponseBody = ContratoProveedorBackend;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Integracion/Contrato/' + id);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): ContratoProveedorBackend => {
  try {
    return axiosResponse.data;
  } catch {
    return null;
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  estado: string().ensure(),
  proveedorId: string().ensure(),
  tiempoMin: string().ensure(),
  tiempoMax: string().ensure(),
  cantidadBloque: string().ensure(),
  reintentos: string().ensure(),
  endpoint: string().ensure(),
  estadoTxt: string().ensure(),
  actividadTipos: string().ensure(),
  dispositivos: string().ensure(),
  filtros: string().ensure(),
  mapeosColumna: string().ensure(),
  cabecerasHttp: string().ensure(),
  mapeosBody: string().ensure(),
  contratoRespuesta: string().ensure(),
});

const getMaybeValid = (
  contratoProveedor: ContratoProveedorBackend
): Promise<ContratoProveedorBackend | null> => {
  return schema
    .isValid(contratoProveedor, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? contratoProveedor : null));
};

const parseContratoProveedor = (
  x: ContratoProveedorBackend
): ContratoProveedorBackend => ({
  id: x.id,
  nombre: x.nombre,
  estado: x.estado,
  proveedorId: x.proveedorId,
  tiempoMin: x.tiempoMin,
  tiempoMax: x.tiempoMax,
  cantidadBloque: x.cantidadBloque,
  reintentos: x.reintentos,
  endpoint: x.endpoint,
  actividadTipos: x.actividadTipos,
  dispositivos: x.dispositivos,
  filtros: x.filtros,
  mapeosColumna: x.mapeosColumna,
  cabecerasHttp: x.cabecerasHttp,
  mapeosBody: x.mapeosBody,
  contratoRespuesta: x.contratoRespuesta,
});

export const fetchByIdContratoProveedor = (
  id: number
): Promise<ContratoProveedorBackend> =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseContratoProveedor);
