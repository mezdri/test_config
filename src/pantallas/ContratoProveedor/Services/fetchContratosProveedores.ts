import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ContratoProveedorBackend } from '@/interfaces/ContratoProveedor';

type HttpResponseBody = ContratoProveedorBackend;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Integracion/Contrato');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): ContratoProveedorBackend[] => {
  try {
    const maybe = axiosResponse.data;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  proveedor: string().ensure(),
  tiempoMin: string().ensure(),
  tiempoMax: string().ensure(),
  cantidadBloque: string().ensure(),
  reintentos: string().ensure(),
  estadoTxt: string().ensure(),
  usuarioCreacion: string().ensure(),
  fechaCreacionTxt: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacionTxt: string().ensure(),
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
  proveedor: x.proveedor,
  proveedorId: x.proveedorId,
  tiempoMin: x.tiempoMin,
  tiempoMax: x.tiempoMax,
  cantidadBloque: x.cantidadBloque,
  reintentos: x.reintentos,
  estado: x.estado,
  estadoTxt: x.estadoTxt,
  usuarioCreacion: x.usuarioCreacion === null ? '' : x.usuarioCreacion,
  fechaCreacionTxt: x.fechaCreacionTxt,
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaModificacionTxt: x.fechaModificacionTxt,
});

export const fetchContratosProveedores = (): Promise<
  ContratoProveedorBackend[]
> =>
  makeHttpRequest()
    .then(getResponseData)
    .then((c): Promise<Array<any | null>> => Promise.all(c.map(getMaybeValid)))
    .then(c => c.filter(x => x))
    .then(c => c.map(parseContratoProveedor));
