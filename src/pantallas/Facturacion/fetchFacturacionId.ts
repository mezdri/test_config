import { number } from 'yup';
// import { tiposDetalle } from './fetchFacturacionId';
import { object, array, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type FacturacionDetalleDataBackend = {
  folio: number;
  // comuna: string;
  // ciudad:string;
  nombre: string;
  rut: string;
  direccion: string;
  giro: string;
  fechaEmision: string;
  condicionPago: string;
  totalIva: number;
  totalNeto: number;
  total: number;
  detalles: {
    nroLinea: number;
    nombreItem: string;
    precioItem: number;
    cantidadItem: number;
    montoItem: number;
    descuento: number;
  }[];
};

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (
  folio: number
): AxiosPromise<FacturacionDetalleDataBackend> => {
  // const folio = config.getClienteSesion();
  return axios.http.get(`Comercial/factura/` + folio);
};

const getResponseData = (
  axiosResponse: AxiosResponse<FacturacionDetalleDataBackend>
): FacturacionDetalleDataBackend => axiosResponse.data;

const schema = object({
  folio: string().ensure(),
  // comuna: string().ensure(),
  // ciudad: string().ensure(),
  nombre: string().ensure(),
  rut: string().ensure(),
  direccion: string().ensure(),
  giro: string().ensure(),
  fechaEmision: string().ensure(),
  condicionPago: string().ensure(),
  totalIva: string().ensure(),
  totalNeto: string().ensure(),
  total: string().ensure(),
  detalles: array(string()),

  tiposDetalle: array(
    object({
      nroLinea: string(),
      nombreItem: string(),
      precioItem: string(),
      cantidadItem: string(),
      montoItem: string(),
      descuento: string(),
    })
  ),
});

const maybeFactura = (
  categoria: FacturacionDetalleDataBackend
): Promise<FacturacionDetalleDataBackend | null> => {
  return schema
    .isValid(categoria, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? categoria : null));
};

const getMaybeValidData = (
  facturacionGridData: FacturacionDetalleDataBackend
): Promise<FacturacionDetalleDataBackend | null> => {
  return schema
    .isValid(facturacionGridData, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? facturacionGridData : null));
};

const parseDetalleFactura = (
  f: FacturacionDetalleDataBackend
): DetalleFactura => {
  return {
    detalles: f.detalles.map(x => ({
      nroLinea: x.nroLinea,
      nombreItem: x.nombreItem,
      precioItem: x.precioItem,
      cantidadItem: x.cantidadItem,
      montoItem: x.montoItem,
      descuento: x.descuento,
    })),
    folio: f.folio,
    // comuna: f.comuna,
    // ciudad: f.ciudad,
    nombre: f.nombre,
    rut: f.rut,
    direccion: f.direccion,
    giro: f.giro,
    fechaEmision: moment(f.fechaEmision),
    condicionPago: f.condicionPago,
    totalIva: f.totalIva,
    totalNeto: f.totalNeto,
    total: f.total,
  };
};

export const fetchFacturacionesId = (folio: number) =>
  makeHttpRequest(folio)
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(parseDetalleFactura);

export type DetalleFactura = {
  detalles: TiposdeDetalle[];
  folio: number;
  // comuna: string;
  // ciudad: string;
  nombre: string;
  rut: string;
  direccion: string;
  giro: string;
  fechaEmision: moment.Moment;
  condicionPago: string;
  totalIva: number;
  totalNeto: number;
  total: number;
};

export type TiposdeDetalle = {
  nroLinea: number;
  nombreItem: string;
  precioItem: number;
  cantidadItem: number;
  montoItem: number;
  descuento: number;
};
