import { object, array, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type FacturacionGridDataBackend = {
  estado_sii: string;
  fecha_emision: string;
  folio: number;
  tipo_dte: number;
  monto_iva: number;
  monto_neto: number;
  monto_total: number;
  uri_pdf: string;
  estado_pago: string;
  url_detalle_pdf: string;
  fecha_vencimiento: string;
  referencias: string;
};

type MsData = {
  estado_sii: string;
  fecha_emision: string;
  folio: number;
  tipo_dte: number;
  monto_iva: number;
  monto_neto: number;
  monto_total: number;
  uri_pdf: string;
  estado_pago: string;
  url_detalle_pdf: string;
  fecha_vencimiento: string;
  referencias: string;
};

export type MsResponseData = {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  data: Array<MsData>;
};

const axios = new AxiosVue(ServicioProxy.Metabase);

export const dowloadDocs = (lista: string[]) => {
  return axios.http.post(`Metabase/PostgenericA/track/dowloadDocs`, {
    listadocs: lista,
  });
};

//definir makeHttpRequest
const makeHttpRequest = (
  numero: string,
  tipoDocumento: string,
  fechaEmisionInicio: string,
  fechaEmisionFin: string,
  estado: string,
  cantRegistros: string,
  clienteDefecto: string
): AxiosPromise<MsResponseData> => {
  let params: params = {
    request: {
      Numero: numero,
      TipoDocumento: tipoDocumento,
      FechaDesde: fechaEmisionInicio,
      FechaHasta: fechaEmisionFin,
      Estado: estado,
      CantRegistros: cantRegistros,
      ClienteDefecto: clienteDefecto,
    },
  };
  return axios.http.post(`Metabase/PostgenericA/track/recibidos`, {
    params: params.request,
  });
};
export type params = {
  request: request;
};

export type request = {
  Numero?: string;
  TipoDocumento?: string;
  FechaDesde?: string;
  FechaHasta?: string;
  Estado?: string;
  CantRegistros?: string;
  ClienteDefecto?: string;
};

const getResponseData = (
  axiosResponse: AxiosResponse<MsResponseData>
): MsResponseData => {
  try {
    const x = axiosResponse.data;
    return x != undefined ? x : null;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidData = (
  MsResponseData: MsResponseData
): Promise<MsResponseData> => {
  return schema
    .isValid(MsResponseData, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? MsResponseData : null));
};

export const parseFactura = (facturacion: any): Factura => {
  return {
    estadoSii: facturacion.estado_sii,
    fechaEmision: facturacion.fecha_emision,
    folio: facturacion.folio,
    tipoDte: tipoDte2Text(facturacion.tipo_dte),
    montoIva: facturacion.monto_iva,
    montoNeto: facturacion.monto_neto,
    montoTotal: facturacion.monto_total,
    uriPdf: facturacion.uri_pdf,
    estadoPago: facturacion.estado_pago,
    urlDetallePdf: facturacion.url_detalle_pdf,
    fechaVencimiento: facturacion.fecha_vencimiento,
    referencias: getUrisRefs(facturacion.referencias),
    referencias_link: getRefsLink(facturacion.referencias),
  };
};

export const fetchDte = (
  numero: string,
  tipoDocumento: string,
  fechaInicioEmision: string,
  fechaFinEmision: string,
  estado: string,
  cantRegistros: string,
  clienteDefecto: string
) =>
  makeHttpRequest(
    numero,
    tipoDocumento,
    fechaInicioEmision,
    fechaFinEmision,
    estado,
    cantRegistros,
    clienteDefecto
  ).then(getResponseData);
//.then(factura => factura.filter(x => x))
//.then(factura => factura.map(parseFactura));

export type Factura = {
  estadoSii: string;
  fechaEmision: string;
  folio: number;
  tipoDte: string;
  montoIva: number;
  montoNeto: number;
  montoTotal: number;
  uriPdf: string;
  estadoPago: string;
  urlDetallePdf: string;
  fechaVencimiento: string;
  referencias: string;
  referencias_link: string;
};

export type DetalleFactura = {
  NroLinea: number;
  CantidadItem: number;
  PrecioItem: number;
  NombreItem: string;
  MontoItem: number;
};

const getRefsLink = (referencias: any[]): string => {
  let uris: string[] = [];
  if (referencias == null) {
    return '';
  }
  referencias.forEach(v => {
    if (v.uri_pdf !== undefined) {
      uris.push(v.FolioRef + '__' + v.uri_pdf);
    }
  });
  return JSON.stringify(uris);
};

const getUrisRefs = (referencias: any[]): string => {
  let uris: string[] = [];
  if (referencias == null) {
    return '';
  }
  referencias.forEach(v => {
    if (v.uri_pdf !== undefined) {
      uris.push(v.uri_pdf);
    }
  });
  return JSON.stringify(uris);
};

const tipoDte2Text = (tipoDte: number): string => {
  let txt = '';
  switch (tipoDte) {
    case 33:
      txt = 'Factura Electrónica';
      break;
    case 34:
      txt = 'Factura Excenta';
      break;
    case 39:
      txt = 'Boleta';
      break;
    case 56:
      txt = 'Nota de débito';
      break;
    case 61:
      txt = 'Nota de crédito';
      break;
    case 52:
      txt = 'Guía de despacho electrónica';
      break;
    default:
      txt = 'No Identificado';
      break;
  }
  return txt + ' (' + tipoDte + ')';
};
