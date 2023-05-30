import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { type } from 'os';

type GeoSitiodBackend = {
  geoSitio: {
    id?: number;
    clienteId?: number;
    tipoZonaId?: number;
    tipoLugarId?: number;
    nombre?: string;
    descripcion?: string;
    tipoGeometria?: number;
    nombreCliente?: string;
    nombreTipoZona?: string;
    nombreTipoLugar?: string;
    nombreTipoGeometria?: string;
  }[];
};
type GeoSitio = {
  geoSitio: {
    id?: number;
    clienteId?: number;
    tipoZonaId?: number;
    tipoLugarId?: number;
    nombre?: string;
    descripcion?: string;
    tipoGeometria?: number;
    nombreCliente?: string;
    nombreTipoZona?: string;
    nombreTipoLugar?: string;
    nombreTipoGeometria?: string;
  }[];
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Reporte);

const makeHttpRequest = (cliente: any): AxiosPromise<GetHttpResponseBody> => {
  var idcliente = cliente;
  return axios.http.get('ReporteGeoSitio/' + idcliente);
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): GeoSitiodBackend => {
  const emptyResponse: GeoSitiodBackend = {
    geoSitio: [],
  };
  try {
    const maybeData =
      axiosResponse.data instanceof Object
        ? { ...emptyResponse, ...axiosResponse.data }
        : emptyResponse;
    return {
      geoSitio: maybeData.geoSitio instanceof Array ? maybeData.geoSitio : [],
    };
  } catch {
    return emptyResponse;
  }
};

const schema = object({
  id: string().ensure(),
  descripcion: string().ensure(),
});

const getMaybeValidGeoSitio = (
  geoSitio: GeoSitiodBackend
): Promise<GeoSitiodBackend | null> => {
  return schema
    .isValid(geoSitio, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? geoSitio : null));
};

const parseGeoSitio = (geo: GeoSitiodBackend): GeoSitio => {
  return {
    geoSitio: geo.geoSitio.map(x => ({
      id: x.id,
      clienteId: x.clienteId,
      descripcion: x.descripcion,
      nombre: x.nombre,
      nombreCliente: x.nombreCliente,
      nombreTipoGeometria: x.nombreTipoGeometria,
      nombreTipoLugar: x.nombreTipoLugar,
      nombreTipoZona: x.nombreTipoZona,
      tipoGeometria: x.tipoGeometria,
      tipoLugarId: x.tipoLugarId,
      tipoZonaId: x.tipoZonaId,
    })),
  };
};
// {
//   id: x.geoSitio,
//   clienteId: x.geoSitio.clienteId,
//   descripcion: x.geoSitio.descripcion,
//   nombre: x.geoSitio.nombre,
//   nombreCliente: x.geoSitio.nombreCliente,
//   nombreTipoGeometria: x.geoSitio.nombreTipoGeometria,
//   nombreTipoLugar: x.geoSitio.nombreTipoLugar,
//   nombreTipoZona: x.geoSitio.nombreTipoZona,
//   tipoGeometria: x.geoSitio.tipoGeometria,
//   tipoLugarId: x.geoSitio.tipoLugarId,
//   tipoZonaId: x.geoSitio.tipoZonaId,
export const fetchSitio = (cliente: any) =>
  makeHttpRequest(cliente)
    .then(getResponseData)
    .then(getMaybeValidGeoSitio)
    .then(parseGeoSitio)
    .catch(x => {
      // TODO sentry log
    });
