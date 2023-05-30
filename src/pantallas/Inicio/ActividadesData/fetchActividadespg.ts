import moment from 'moment';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { object, string } from 'yup';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type ActividadesHttpResponseBody = {
  data?: unknown;
};

type ActividadBackend = {
  idInterno: number;
  actividadExtendidaNombre: string;
  actividadExtendidaMostrar: { descripcion: string; valor: string }[];
  id: string; //"101156800"
  codigoActividad: number; // 20,
  fechaActividad: string; //"2019-11-14T15:33:10",
  fechaRecepcion: string; //"2019-11-14T15:33:10",
  gpsId: number; // 3532,
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
  horasmotor_calibrado?: string;
  odometro_calibrado?: string;
};

export type ActividadExtendida = {
  nombre: string;
  dispositivos: { descripcion: string; valor: string }[];
};

export type Actividad = {
  idInterno: number;
  extendida: ActividadExtendida | null;
  id: string; //"101156800"
  codigoActividad: number; // 20,
  // TODO transformar a moment.Moment
  fechaActividad: moment.Moment; //"2019-11-14T15:33:10",
  fechaRecepcion: moment.Moment; //"2019-11-14T15:33:10",
  gpsId: number; // 3532,
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
  odometro_calibrado?: string;
  horasmotor_calibrado?: string;
};

const responseToActividadsBackend = (
  axiosResponse: AxiosResponse<ActividadesHttpResponseBody>
): ActividadBackend[] => {
  let actividades: unknown;
  try {
    actividades = axiosResponse.data.data;
  } catch {
    actividades = [];
  }
  return actividades instanceof Array ? actividades : [];
};

const axiosVue = new AxiosVue(ServicioProxy.Vehiculo);

const makeHttpRequest = (
  params: any
): AxiosPromise<ActividadesHttpResponseBody> => {
  let clienteId: number = config.getClienteSesion();
  var d = params.fechaActividad;
  var f = params.fechaActividad;
  var horaini = d.hour();
  var hora = moment(d)
    .add(1, 'hour')
    .hour();
  var fechafin: string = formatDate(d);
  f.add(-1, 'days');
  var fechaini: string = formatDate(f);

  var parmsv2: any = {
    client: clienteId,
    ending_date: fechafin.toString(),
    starting_date: fechaini.toString(),
    starting_hour: horaini,
    ending_hour: hora,
    vehiculoid: params.vehiculoid,
    pagina: params.pagina,
    user: params.user,
  };
  /*
params.client = 3798,
params.ending_date = "2022-01-05",
params.ending_hour = 13,
params.pagina = 1,
params.starting_date = "2022-01-05",
params.starting_hour = 8,
params.user = 137,
params.vehiculoid = 1170
*/

  return axiosVue.http.post(`ActividadExterna/grillaActividadesV2`, parmsv2);
};

const parseActividad = (x: ActividadBackend): Actividad => {
  return {
    idInterno: x.idInterno,
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
    id: x.id,
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
    nombreConductor: x.nombreConductor || '',
    rutConductor: x.rutConductor,
    unidad: x.unidad,
    actividadId: x.actividadId,
    geocerca: x.geocerca,
    horasmotor_calibrado: x.horasmotor_calibrado,
    odometro_calibrado: x.odometro_calibrado,
  };
};

function formatDate(date: any) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

const schema = object({
  // id: string().required(),
  nombreConductor: string().ensure(),
  // unidad: string().ensure(),
  // latitud: number(),
  // longitud: number(),
  // transmitiendo: boolean(),
  // ubicacion: string().ensure(),
});

const getMaybeValidActividad = (
  actividad: ActividadBackend
): Promise<ActividadBackend | null> => {
  return schema.isValid(actividad).then(valid => (valid ? actividad : null));
};

export const fetchActividades = (params?: any): Promise<Actividad[]> =>
  makeHttpRequest(params)
    .then(responseToActividadsBackend)
    .then(
      (actividades): Promise<Array<ActividadBackend | null>> =>
        Promise.all(actividades.map(getMaybeValidActividad))
    )
    .then(actividades => actividades.filter(x => x))
    .then(actividades => actividades.map(parseActividad));
