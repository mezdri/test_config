import moment from 'moment';
import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { RepetirDiaRequestVm } from '@/interfaces/RepetirDiaRequestVm';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type RepetirDiaBackend = {
  id: string; //"101156800"
  codigoActividad: number; // 20,
  fechaActividad: string; //"2019-11-14T15:33:10",
  fechaRecepcion: string; //"2019-11-14T15:33:10",
  gpsId: number; // 3532,
  orientacion: number; //349.0
  gpsValid: number; // 1,
  latitud: number; // -33.4396140000089,
  longitud: number; //-70.6307990000089,
  velocidadActual: number; // 85.0,
  velocidadMaxima: number; //55.0,
  ubicacion: string; //"Axity101156800",
  distanciaRecorrida: number; // 0.0,
  distanciaAcumulada: number; //0.0
  nroSatelites: number; //8,
  vehiculoId: number; //3532,
  conductorId: number; //1499,
  hdop: number; //11.0,
  odometro: number; //181636.0,
  horasMotor: number; // 0.0,
  altura: number; //0,
  heading: number; //299,
  nombreProveedor: string; // "GPS Chile",
  ignicion: number; // 1,
  actividadExtendidaTipo: number; // 0,
  actividadExtendidaValor: string; // "",
  patente: string; //"JPKV32",
  actividadTipoNombre: string; // "ACTUALIZACION PROGRAMADA",
  transmitiendo: boolean; // false,
  nombreConductor: string; // "Default ",
  rutConductor: string; // "10042872-5",
  unidad: string; //"JPKV32",
  actividadId: string; // "101156800",
  fechaActividadTxt: string; // "14/11/2019 15:33:10",
  velocidadActualTxt: string; // "85 Km/h",
  distanciaRecorridaTxt: string; // "0 Km",
  distanciaAcumuladaTxt: string; // "0 Km",
  velocidadMaximaTxt: string; // "55 Km/h"
  geocerca: string; // "Costanera"
  actividadExtendidaNombre: string;
  actividadExtendidaMostrar: { descripcion: string; valor: string }[];
};

export type ActividadExtendida = {
  nombre: string;
  dispositivos: { descripcion: string; valor: string }[];
};

export type RepetirDia = {
  id: string; //"101156800"
  codigoActividad: number; // 20,
  fechaActividad: moment.Moment; //"2019-11-14T15:33:10",
  fechaRecepcion: moment.Moment; //"2019-11-14T15:33:10",
  gpsId: number; // 3532,
  orientacion: number; //349.0
  gpsValid: number; // 1,
  latitud: number; // -33.4396140000089,
  longitud: number; //-70.6307990000089,
  velocidadActual: number; // 85.0,
  velocidadMaxima: number; //55.0,
  ubicacion: string; //"Axity101156800",
  distanciaRecorrida: number; // 0.0,
  distanciaAcumulada: number; //0.0
  nroSatelites: number; //8,
  vehiculoId: number; //3532,
  hdop: number; //11.0,
  odometro: number; //181636.0,
  horasMotor: number; // 0.0,
  altura: number; //0,
  heading: number; //299,
  nombreProveedor: string; // "GPS Chile",
  ignicion: number; // 1,
  actividadExtendidaTipo: number; // 0,
  actividadExtendidaValor: string; // "",
  actividadTipoNombre: string; // "ACTUALIZACION PROGRAMADA",
  transmitiendo: boolean; // false,
  nombreConductor: string; // "Default ",
  rutConductor: string; // "10042872-5",
  unidad: string; //"JPKV32",
  actividadId: string; // "101156800",
  geocerca: string; // "Costanera"
  extendida: ActividadExtendida | null;
};

export class RepetirDiaRequest {
  clienteId?: number;
  vehiculoId?: number;
  fechaInicio?: Date;
  fechaTermino?: Date;
  orderDescending?: boolean;
}

export type RepetirDiaHttpResponseBody = {
  data?: unknown;
};
export type RepetirDiaHttpRequestBody = {
  params: RepetirDiaRequest;
};

const axios = new AxiosVue(ServicioProxy.Vehiculo);

const makeHttpRequest = (
  params: RepetirDiaRequest
): AxiosPromise<RepetirDiaHttpResponseBody> => {
  const body: RepetirDiaHttpRequestBody = { params };
  return axios.http.get(`repetirDia`, body);
};

const responseToRepetirDiaBackend = (
  axiosResponse: AxiosResponse<RepetirDiaHttpResponseBody>
): RepetirDiaBackend[] => {
  let repetirDia: unknown;
  try {
    repetirDia = axiosResponse.data;
  } catch {
    repetirDia = [];
  }
  if (repetirDia instanceof Array) {
    return repetirDia;
  }
  return [];
};

const schema = object({});

const getMaybeValidRepetirDia = (
  actividad: RepetirDiaBackend
): Promise<RepetirDiaBackend | null> => {
  return schema
    .isValid(actividad, { strict: true })
    .then(valid => (valid ? actividad : null));
};

const parseRepetirDia = (x: RepetirDiaBackend): RepetirDia => {
  return {
    id: x.id,
    extendida: x.actividadExtendidaNombre
      ? {
          nombre: x.actividadExtendidaNombre,
          dispositivos: x.actividadExtendidaMostrar
            ? x.actividadExtendidaMostrar
                .map(x =>
                  x.descripcion && x.valor
                    ? {
                        descripcion: x.descripcion,
                        valor: x.valor,
                      }
                    : null
                )
                .filter(x => !!x)
            : null,
        }
      : null,
    codigoActividad: x.codigoActividad,
    fechaActividad:
      typeof x.fechaActividad === 'string'
        ? moment(x.fechaActividad)
        : // Moment inválido, siempre revisar usando .isValid() antes de usar
          moment(''),
    fechaRecepcion:
      typeof x.fechaRecepcion === 'string'
        ? moment(x.fechaRecepcion)
        : // Moment inválido, siempre revisar usando .isValid() antes de usar
          moment(''),
    gpsId: x.gpsId,
    orientacion: x.orientacion,
    gpsValid: x.gpsValid,
    latitud: x.latitud,
    longitud: x.longitud,
    velocidadActual: x.velocidadActual,
    velocidadMaxima: x.velocidadMaxima,
    ubicacion: x.ubicacion,
    distanciaRecorrida: x.distanciaRecorrida,
    distanciaAcumulada: x.distanciaAcumulada,
    nroSatelites: x.nroSatelites,
    vehiculoId: x.vehiculoId,
    hdop: x.hdop,
    odometro: x.odometro,
    horasMotor: x.horasMotor,
    altura: x.altura,
    heading: x.heading,
    nombreProveedor: x.nombreProveedor,
    ignicion: x.ignicion,
    actividadExtendidaTipo: x.actividadExtendidaTipo,
    actividadExtendidaValor: x.actividadExtendidaValor,
    actividadTipoNombre: x.actividadTipoNombre,
    transmitiendo: x.transmitiendo,
    nombreConductor: x.nombreConductor,
    rutConductor: x.rutConductor,
    unidad: x.unidad,
    actividadId: x.actividadId,
    geocerca: x.geocerca,
  };
};

export const fetchRepetirDia = (
  params: RepetirDiaRequest
): Promise<RepetirDia[]> =>
  makeHttpRequest(params)
    .then(responseToRepetirDiaBackend)
    .then(
      (repetirDia): Promise<Array<RepetirDiaBackend | null>> =>
        Promise.all(repetirDia.map(getMaybeValidRepetirDia))
    )
    .then(repetirDia => repetirDia.filter(x => x))
    .then(repetirDia => repetirDia.map(parseRepetirDia));
