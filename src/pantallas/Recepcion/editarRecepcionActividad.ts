import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { RecepcionActividadDetalle } from '@/pantallas/Recepcion/fetchRecepcionActividad';

type HttpRequestBody = {
  id: number;
  clienteProveedorId: number;
  proveedorId: number;
  usuario: string;
  password: string;
  fechaIni: string;
  fechaFin: string;
  tiempoMinimo: number;
  cantidadBloque: number;
  estado: number;
  flotas: number[];
  etiquetas: number[];
  vehiculos: number[];
};

const axios = new AxiosVue(ServicioProxy.Integracion);
const makeHttpRequest = (
  recepcionActividad: RecepcionActividadDetalle
): AxiosPromise<unknown> => {
  const body: HttpRequestBody = {
    id: recepcionActividad.id,
    clienteProveedorId: recepcionActividad.clienteProveedor.id,
    proveedorId: recepcionActividad.proveedor.id,
    usuario: recepcionActividad.login,
    password: recepcionActividad.password,
    fechaIni: recepcionActividad.fechaInicio.format(),
    fechaFin: recepcionActividad.fechaTermino
      ? recepcionActividad.fechaTermino.format()
      : null,
    tiempoMinimo: recepcionActividad.intervaloTransmiciones,
    cantidadBloque: recepcionActividad.numeroRegistrosPorBloque,
    estado: recepcionActividad.estado.id,
    flotas: recepcionActividad.flotasId,
    etiquetas: recepcionActividad.etiquetasId,
    vehiculos: recepcionActividad.vehiculosId,
  };
  return axios.http.put(`integracion/recepciones`, body);
};

export const editarRecepcionActividad = (
  recepcionActividad: RecepcionActividadDetalle
) => makeHttpRequest(recepcionActividad);
