import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { DescargaActividadForm } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';

type HttpRequestBody = {
  clienteProveedorId: number;
  proveedorId: number;
  usuario: string;
  password: string;
  fechaIni: string;
  fechaFin: string;
  maxPeticionesDia: number;
  maxPeticionesHora: number;
  maxRegistrosBloque: number;
  estado: number;
  flotas: number[];
  etiquetas: number[];
  vehiculos: number[];
  dispositivos: number[];
  actividadTipos: number[];
  campos: number[];
};

const makeHttpRequest = ({
  general,
  flotasId,
  etiquetasId,
  vehiculosId,
  dispositivosId,
  tiposActividadId,
  camposId,
}: CreacionDescargaActividad): AxiosPromise<unknown> => {
  const body: HttpRequestBody = {
    clienteProveedorId: general.clienteProveedor.id,
    proveedorId: general.proveedor.id,
    usuario: general.usuario,
    password: general.password,
    fechaIni: general.fechaInicio.format(),
    fechaFin: general.fechaTermino ? general.fechaTermino.format() : null,
    maxPeticionesDia: general.maximoPeticionesDia,
    maxPeticionesHora: general.maximoPeticionesHora,
    maxRegistrosBloque: general.maximoRegistrosBloque,
    estado: general.estado.id,
    flotas: flotasId,
    etiquetas: etiquetasId,
    vehiculos: vehiculosId,
    dispositivos: dispositivosId,
    actividadTipos: tiposActividadId,
    campos: camposId,
  };
  const axios = new AxiosVue(ServicioProxy.Integracion);
  return axios.http.post(`integracion/descarga`, body);
};

type CreacionDescargaActividad = {
  general: DescargaActividadForm;
  flotasId: number[];
  etiquetasId: number[];
  vehiculosId: number[];
  dispositivosId: number[];
  tiposActividadId: number[];
  camposId: number[];
};

export const crearDescargaActividad = (descarga: CreacionDescargaActividad) =>
  makeHttpRequest(descarga);
