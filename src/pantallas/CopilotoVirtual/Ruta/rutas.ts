import { StringNullableChain } from 'lodash';
import moment from 'moment';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';

export type Ruta = {
  id: number;
  clienteId: number;
  nombre: string;
  usuarioCreadorId: string;
  usuarioCreador: string;
  nombreModificador: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionId?: number;
  fechaModificacion?: moment.Moment;
};

export type BaseRuta = {
  nombre: string;
  zonaNombre: string;
  zona: number;
  colorHex: string;
  color:string;
  velocidadMaxima: number;
  velocidadMinima: number;
  pdetenciontxt: string;
  permitirDetencion: boolean;
  repetirMensaje: boolean;
  rmensajetxt: string;
  tiempoMaximo: number;
  tiempoRepetir: number;
  horaDesde: string;
  horaHasta: string;
  tiempoEntradaGeocerca: number;
  lstTipoEventoCopiloto: TipoEventoCopiloto[];
  lstRutaEventoMensaje: Mensaje[];
  id: number;
  rutaId: number;
  coordenadaId:number;
};

export type TipoEventoCopiloto = {
  id: number;
  idZona: number;
  nombre: string;
  selected: boolean;
};

export type TipoEventoCopilotoSeleccionado = {
  nombreRuta: string;
  zonaNombre: string;
  nombreEvento: string;
  idEvento: number;
  idZona: number;
  id:number;
};
export type MensajeSeleccionado = {
  nombreRuta: string;
  zonaNombre: string;
  nombreEvento: string;
  idEvento: number;
  idZona: number;
  idMensaje: number;
  titulo: string;
  selected: boolean;
};

export type Color = {
  color: string;
  colorhexadecimal: string;
};

export type RutaNueva = {
  nombre: string;
};

export type RutaCoordenada = {
  id: number;
  rutaId: number;
  coordenadaId: number;
  color: string;
  velocidadMaxima: number;
  velocidadMinima: number;
  permitirDetencion: boolean;
  tiempoMaximo: number;
  horaDesde: string;
  horaHasta: string;
  colorHex: string;
  tiempoEntradaGeocerca: number;
  repetirMensaje: Boolean;
  tiempoRepetir: number;
};

export type RutaEvento = {
  id: number;
  tipoEventoCopilotoId: number;
  rutaCoordenadaId: number;
  rutaId: number;
};

export type RutaEventoMensaje = {
  MensajeCopilotoId: number;
  RutaEventoId: number;
};

export type RutaVehiculo = {
  vehiculoId: number;
  rutaId: number;
};
export type RutaFlota = {
  flotaId: number;
  rutaId: number;
};
export type RutaEtiqueta = {
  etiquetaId: number;
  rutaId: number;
};
