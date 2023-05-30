import { array, boolean, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { HomeFiltros, ServicioProxy } from '@/config/enums';
import moment from 'moment';

type EstadoVehiculo = {
  id: number;
  nombre: string;
};

export type Vehiculo = {
  ano: string;
  ciaTelecomunicaciones: string;
  estado: EstadoVehiculo;
  fechaUltimaActividad: moment.Moment;
  fechaUltimaActividadTxt: string;
  flota: string;
  id: number;
  imei: string;
  marcaGps: string;
  modelo: string;
  modeloGps: string;
  nombreConductor: string;
  numeroMotor: string;
  numeroSerie: string;
  numeroSim: string;
  referencia: string;
  tipoCombustible: string;
  tipoPeaje: string;
  tipoSim: string;
  tipoTransmision: string;
  tipoVehiculo: string;
  ultimaActividad: {
    fechaRecepcion: moment.Moment;
    fechaActividad: moment.Moment;
    actividadId: number | string;
    ignicion: boolean;
    latitud: number | null;
    longitud: number | null;
    transmitiendo: boolean;
    ubicacion: string;
    velocidadActual: number | null;
    vehiculoId: string | number;
    nombreConductor: string; // "Default ",
    rutConductor: string; // "10042872-5",
    unidad: string;
  };
  unidad: string;
  estadoCortaCorriente: string;
  etiquetas: string;
  vin: string;
  patente: string;
};

const axios = new AxiosVue(ServicioProxy.Sugal);
type HttpResponseBody = unknown;
const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(`Sugal/GetListaVehiculos`);
};

const parseVehiculo = (x: any): Vehiculo => {
  return {
    ano: x.ano,
    ciaTelecomunicaciones: x.ciaTelecomunicaciones,
    estado: {
      id: x.estado,
      nombre: x.estadoTxt,
    },
    fechaUltimaActividad: moment(x.fechaUltimaActividad),
    fechaUltimaActividadTxt: x.fechaUltimaActividadTxt,
    flota: x.flota,
    id: x.id,
    imei: x.imei,
    marcaGps: x.marcaGps,
    modelo: x.modelo,
    modeloGps: x.modeloGps,
    nombreConductor: x.nombreConductor,
    numeroMotor: x.numeroMotor,
    numeroSerie: x.numeroSerie,
    numeroSim: x.numeroSim,
    referencia: x.referencia,
    tipoCombustible: x.tipoCombustible,
    tipoPeaje: x.tipoPeaje,
    tipoSim: x.tipoSim,
    tipoTransmision: x.tipoTransmision,
    tipoVehiculo: x.tipoVehiculo,
    ultimaActividad: {
      fechaRecepcion:
        typeof x.ultimaActividad.fechaRecepcion === 'string'
          ? moment(x.ultimaActividad.fechaRecepcion)
          : // Moment inválido, siempre revisar usando .isValid() antes de usar
            moment(''),
      fechaActividad:
        typeof x.ultimaActividad.fechaActividad === 'string'
          ? moment(x.ultimaActividad.fechaActividad)
          : // Moment inválido, siempre revisar usando .isValid() antes de usar
            moment(''),
      actividadId: x.ultimaActividad.actividadId,
      ignicion: x.ultimaActividad.ignicion,
      latitud:
        // valores de geolocación 0 tratados como inválidos
        x.ultimaActividad.latitud === 0 ? null : x.ultimaActividad.latitud,
      longitud:
        // valores de geolocación 0 tratados como inválidos
        x.ultimaActividad.longitud === 0 ? null : x.ultimaActividad.longitud,
      transmitiendo: x.ultimaActividad.transmitiendo,
      velocidadActual: x.ultimaActividad.velocidadActual,
      ubicacion: x.ultimaActividad.ubicacion,
      vehiculoId: x.ultimaActividad.vehiculoId,
      nombreConductor: x.nombreConductor,
      rutConductor: x.rutConductor,
      unidad: x.unidad,
    },
    unidad: x.unidad,
    estadoCortaCorriente: x.estadoCortaCorriente,
    etiquetas: x.etiquetas,
    vin: x.vin,
    patente: x.patente,
  };
};
export type HomeGridHttpResponseBody = {
  cantidadVehiculosSinTransmitir?: unknown;
  cantidadVehiculosTransmitiendo?: unknown;
  ultimoDato?: unknown;
  vehiculos?: unknown;
};
export type HomeGridHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
  elementosSeleccionados: number[];
  filtro: HomeFiltros;
  ultimoDato?: unknown;
  unidadSeleccionada: string;
};

const responseToVehiculosBackend = (
  axiosResponse: AxiosResponse<HomeGridHttpResponseBody>
): any[] => {
  let vehiculos: any[];
  try {
    const maybeVehiculos = axiosResponse.data.vehiculos;
    vehiculos = maybeVehiculos instanceof Array ? maybeVehiculos : [];
  } catch {
    vehiculos = [];
  }
  return vehiculos.map(x => ({
    ...x,
    ultimaActividad: x.ultimaActividad || null,
  }));
};

const schema = object({
  id: number().required(),
});

const getMaybeValidVehiculo = (vehiculo: any): Promise<any | null> => {
  return schema
    .isValid(vehiculo, { strict: true })
    .then(valid => (valid ? vehiculo : null));
};

export const fetchListaVehiculos = (): Promise<Vehiculo[]> =>
  makeHttpRequest()
    .then(responseToVehiculosBackend)
    .then(
      (vehiculos): Promise<Array<any | null>> =>
        Promise.all(vehiculos.map(getMaybeValidVehiculo))
    )
    .then(vehiculos => vehiculos.filter(x => x))
    .then(vehiculos => vehiculos.map(parseVehiculo));
