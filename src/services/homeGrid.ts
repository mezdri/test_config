export type VehiculoHomeGrid = {
  ano: string;
  ciaTelecomunicaciones: string;
  estado: number;
  // TODO debería ser declarado como moment.Moment
  fechaUltimaActividad: string;
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
  patente: string;
  referencia: string;
  tipoCombustible: string;
  tipoPeaje: string;
  tipoSim: string;
  tipoTransmision: string;
  tipoVehiculo: string;
  ultimaActividad: {
    // TODO debería ser declarado como moment.Moment
    fechaRecepcion: string;
    ignicion: boolean;
  };
  unidad: string;
  vin: string;
  estadoCortaCorriente: string;
};

export type VehiculoBackend = {
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
    actividadId: unknown;
    fechaRecepcion: string; // '2019-05-22T23:58:28'
    gpsId: number; // 1856
    id: unknown; // null
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
    vehiculoId: unknown;
  };
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
};
