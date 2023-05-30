import moment from 'moment';
import { object, number, boolean, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { HomeFiltros, ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { filtroHomeEventBus } from '@/setup';

type VehiculoBackend = {
  ano: string; // '2015'
  cantidadVehiculosSinTransmitir: number; // 64
  cantidadVehiculosTransmitiendo: number; // 0
  ciaTelecomunicaciones: string; // 'Entel'
  clienteId: number; // 0
  color: string; // ''
  compartidoPor: unknown; // null
  esCompartido: boolean; // false
  estado: number; // 1
  estadoTxt: string; // 'Activo'
  fechaUltimaActividad: string; // '2019-05-22T23:58:28'
  fechaUltimaActividadTxt: string;
  flota: string; // 'Flota Base'
  flotaActual: unknown; // null
  flotaId: number; // 21
  id: number; // 1856
  imei: string; // '357041066413363'
  marcaGps: string; // 'Calamp'
  modelo: string; // 'ACTROS 2651 6X4'
  modeloGps: string; // 'LMU26H30'
  nombreConductor: string; // 'default  '
  numeroChasis: string; // ''
  numeroMotor: string; // ''
  numeroSerie: string; // '6450'
  numeroSim: string; // '89560100000884414166'
  patente: string; // 'KPCD71'
  poseeTag: boolean; // false
  referencia: string; // 'KPCD-71 EC'
  rutConductor: string; // '10045318-5'
  tipoCombustible: string; // 'DIES'
  tipoPeaje: string; // 'C'
  tipoSim: string; // 'Nacional'
  tipoTransmision: string; // 'MEC'
  tipoVehiculo: string; // 'CAMIONES'
  ultimaActividad: {
    fechaRecepcion: string; // '2019-05-22T23:58:28'
    fechaActividad: string;
    gpsId: number; // 1856
    actividadId: string; // null
    vehiculoId: string;
    ignicion: boolean; // true
    latitud: number; // -20.9551
    longitud: number; // -68.7086
    nombreConductor: string; // '  '
    orientacion: number; // 0
    patente: string; // 'KPCD71'
    rutConductor: string; // ''
    transmitiendo: boolean; // false
    ubicacion: string; // 'Pica, Provincia del Tamarugal, Chile'
    ultimaTransmicionTxt: string; // '22-05-2019'
    unidad: string; // 'KPCD71'
    velocidadActual: number; // 0
    velocidadMaxima: number; // 0
    heading: number;
    proveedor: string;
  } | null;
  unidad: string; // 'KPCD71'
  vehiculoModelo: unknown; // null
  vehiculoModeloId: number; // 1640
  vehiculoTercero: boolean; // false
  vehiculoTipo: unknown; // null
  vehiculoTipoCombustible: unknown; // null
  vehiculoTipoCombustibleId: number; // 2
  vehiculoTipoId: number; // 2
  vehiculoTipoPeaje: unknown; // null
  vehiculoTipoPeajeId: number; // 3
  vehiculoTipoTransmision: unknown; // null
  vehiculoTipoTransmisionId: number; // 2
  vehiculosFlotas: unknown; // null
  vin: string; // ''
  estadoCortaCorriente: string;
  etiquetas: Etiquetas[];
};

type EstadoVehiculo = {
  id: number;
  nombre: string;
};

type Etiquetas = {
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
    heading: number;
    proveedor: string;
  };
  unidad: string;
  estadoCortaCorriente: string;
  etiquetas: string;
  vin: string;
  patente: string;
};

export type smVehiculo = {
  id: number;
  transmitiendo: boolean;
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

const axios = new AxiosVue(ServicioProxy.Vehiculo);

const makeHttpRequest = (): AxiosPromise<HomeGridHttpResponseBody> => {
  const body: HomeGridHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
    elementosSeleccionados: filtroHomeEventBus.elementosSeleccionados,
    filtro: filtroHomeEventBus.filtro,
    unidadSeleccionada: filtroHomeEventBus.unidadSeleccionada, //Filtro Vehiculo Home
  };
  return axios.http.post('Vehiculo/grillaVehiculos', body);
};

const responseToVehiculosBackend = (
  axiosResponse: AxiosResponse<HomeGridHttpResponseBody>
): VehiculoBackend[] => {
  let vehiculos: VehiculoBackend[];
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
  nombreConductor: string().ensure(),
  ultimaActividad: object({
    fechaRecepcion: string(),
    latitud: number(),
    longitud: number(),
    transmitiendo: boolean(),
    velocidadActual: number(),
    ubicacion: string().ensure(),
  }),
  unidad: string().ensure(),
});

const getMaybeValidVehiculo = (
  vehiculo: VehiculoBackend
): Promise<VehiculoBackend | null> => {
  return schema
    .isValid(vehiculo, { strict: true })
    .then(valid => (valid ? vehiculo : null));
};

const getEtiquetasVehiculo = (etiquetas: Etiquetas[]): string => {
  if (etiquetas.length === 0) {
    return '';
  }

  let etiqueta: string = '';

  etiquetas.forEach((x: Etiquetas, index) => {
    if (index === etiquetas.length - 1) {
      etiqueta = etiqueta + '[' + x.nombre + ']';
    } else {
      etiqueta = etiqueta + '[' + x.nombre + '],';
    }
  });

  return etiqueta;
};

const parseVehiculo = (x: VehiculoBackend): Vehiculo => {
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
      heading: x.ultimaActividad.heading,
      proveedor: x.ultimaActividad.proveedor,
    },
    unidad: x.unidad,
    estadoCortaCorriente: x.estadoCortaCorriente,
    etiquetas: getEtiquetasVehiculo(x.etiquetas),
    vin: x.vin,
    patente: x.patente,
  };
};

export const fetchVehiculos = (): Promise<Vehiculo[]> =>
  makeHttpRequest()
    .then(responseToVehiculosBackend)
    .then(
      (vehiculos): Promise<Array<VehiculoBackend | null>> =>
        Promise.all(vehiculos.map(getMaybeValidVehiculo))
    )
    .then(vehiculos => vehiculos.filter(x => x))
    .then(vehiculos => vehiculos.map(parseVehiculo));
