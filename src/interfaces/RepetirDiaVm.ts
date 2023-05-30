import moment from 'moment';

export class RepetirDiaVm {
  fechaActividad?: moment.Moment;
  fechaRecepcion?: moment.Moment;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  velocidadActual?: number;
  velocidadMaxima?: number;
  patente?: string;
  nombreConductor?: string;
  gpsId?: number;
  ignicion?: boolean;
  transmitiendo?: boolean;
  id?: number;
  orientacion?: number;
  rutConductor?: string;
  unidad?: string;
  proveedor?: string;
}
