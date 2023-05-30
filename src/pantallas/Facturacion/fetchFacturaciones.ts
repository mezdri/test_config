import { object, array, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type FacturacionGridDataBackend = {
  RutEmisor: string;
  NombreEmisor: string;
  GiroEmisor: string;
  DireccionEmisor: string;
  CiudadEmisor: string;
  ComunaEmisor: string;
  RutReceptor: string;
  NombreReceptor: string;
  GiroReceptor: string;
  DireccionReceptor: string;
  CiudadReceptor: string;
  ComunaReceptor: string;
  Folio: number;
  TipoDocumento: string;
  Estado: string;
  FechaEmision: string;
  FechaVencimiento: string;
  FechaPago: string;
  TotalIva: number;
  TotalNeto: number;
  Total: number;
  CondicionDePago: string;
  Descuento: number;
  Url: string;
  fechaEmisionText: string;
  fechaVencimientoText: string;
  fechaPagoText: string;
  lDetalleDocumento: DetalleFactura[];
};

const axios = new AxiosVue(ServicioProxy.Comercial);

//definir makeHttpRequest
const makeHttpRequest = (
  tipoDocumento: string,
  numero: string,
  condicionPago: string,
  fechaEmisionInicio: string,
  fechaEmisionFin: string,
  estado: string
): AxiosPromise<FacturacionGridDataBackend> => {
  let params: params = {
    request: {
      TipoDocumento: tipoDocumento,
      Numero: numero,
      CondicionPago: condicionPago,
      FechaDesde: fechaEmisionInicio,
      FechaHasta: fechaEmisionFin,
      Estado: estado,
    },
  };
  return axios.http.get(`Comercial/factura`, {
    params: params.request,
  });
};
export type params = {
  request: request;
};

export type request = {
  TipoDocumento?: string;
  Numero?: string;
  CondicionPago?: string;
  FechaDesde?: string;
  FechaHasta?: string;
  Estado?: string;
};

const getResponseData = (
  axiosResponse: AxiosResponse<FacturacionGridDataBackend>
): FacturacionGridDataBackend[] => {
  try {
    const maybePautasActividades = axiosResponse.data;
    return maybePautasActividades instanceof Array
      ? maybePautasActividades
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidData = (
  facturacionGridData: FacturacionGridDataBackend
): Promise<FacturacionGridDataBackend> => {
  return schema
    .isValid(facturacionGridData, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? facturacionGridData : null));
};

const parseFactura = (facturacion: FacturacionGridDataBackend): Factura => {
  return {
    rutEmisor: facturacion.RutEmisor,
    nombreEmisor: facturacion.NombreEmisor,
    giroEmisor: facturacion.GiroEmisor,
    direccionEmisor: facturacion.DireccionEmisor,
    ciudadEmisor: facturacion.CiudadEmisor,
    comunaEmisor: facturacion.ComunaEmisor,
    rutReceptor: facturacion.RutReceptor,
    nombreReceptor: facturacion.NombreReceptor,
    giroReceptor: facturacion.GiroReceptor,
    direccionReceptor: facturacion.DireccionReceptor,
    ciudadReceptor: facturacion.CiudadReceptor,
    comunaReceptor: facturacion.ComunaReceptor,
    folio: facturacion.Folio,
    tipoDocumento: facturacion.TipoDocumento,
    estado: facturacion.Estado,
    fechaEmision: makeNullableMoment(facturacion.FechaEmision),
    fechaVencimiento: makeNullableMoment(facturacion.FechaVencimiento),
    fechaPago: makeNullableMoment(facturacion.FechaPago),
    totalIva: facturacion.TotalIva,
    totalNeto: facturacion.TotalNeto,
    total: facturacion.Total,
    condicionDePago: facturacion.CondicionDePago,
    descuento: facturacion.Descuento,
    url: facturacion.Url,
    fechaEmisionText: facturacion.fechaEmisionText,
    fechaVencimientoText: facturacion.fechaVencimientoText,
    fechaPagoText: facturacion.fechaPagoText,
    lDetalleDocumento: facturacion.lDetalleDocumento,
  };
};

export const fetchFacturaciones = (
  tipoDocumento: string,
  numero: string,
  condicionPago: string,
  fechaInicioEmision: string,
  fechaFinEmision: string,
  estado: string
) =>
  makeHttpRequest(
    tipoDocumento,
    numero,
    condicionPago,
    fechaInicioEmision,
    fechaFinEmision,
    estado
  )
    .then(getResponseData)
    .then(
      (factura): Promise<Array<FacturacionGridDataBackend | null>> =>
        Promise.all(factura.map(getMaybeValidData))
    )
    .then(factura => factura.filter(x => x))
    .then(factura => factura.map(parseFactura));

export type Factura = {
  rutEmisor: string;
  nombreEmisor: string;
  giroEmisor: string;
  direccionEmisor: string;
  ciudadEmisor: string;
  comunaEmisor: string;
  rutReceptor: string;
  nombreReceptor: string;
  giroReceptor: string;
  direccionReceptor: string;
  ciudadReceptor: string;
  comunaReceptor: string;
  folio: number;
  tipoDocumento: string;
  estado: string;
  fechaEmision: moment.Moment;
  fechaVencimiento: moment.Moment;
  fechaPago: moment.Moment;
  totalIva: number;
  totalNeto: number;
  total: number;
  condicionDePago: string;
  descuento: number;
  url: string;
  fechaEmisionText: string;
  fechaVencimientoText: string;
  fechaPagoText: string;
  lDetalleDocumento: DetalleFactura[];
};

export type DetalleFactura = {
  NroLinea: number;
  CantidadItem: number;
  PrecioItem: number;
  NombreItem: string;
  MontoItem: number;
};
