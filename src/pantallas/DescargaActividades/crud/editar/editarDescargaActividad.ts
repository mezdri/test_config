import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { DescargaActividadForm } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';

type HttpRequestBody = {
  id: number;
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
  id,
  general,
  flotasId,
  etiquetasId,
  vehiculosId,
  dispositivosId,
  tiposActividadId,
  camposId,
}: EdicionDescargaActividad): AxiosPromise<unknown> => {
  const body: HttpRequestBody = {
    id,
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
  return axios.http.put(`integracion/descarga`, body);
};

type EdicionDescargaActividad = {
  id: number;
  general: DescargaActividadForm;
  flotasId: number[];
  etiquetasId: number[];
  vehiculosId: number[];
  dispositivosId: number[];
  tiposActividadId: number[];
  camposId: number[];
};

export const editarDescargaActividad = (descarga: EdicionDescargaActividad) =>
  makeHttpRequest(descarga);
