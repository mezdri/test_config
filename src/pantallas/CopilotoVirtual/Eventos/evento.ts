import moment from 'moment';

export type evento = {
  clienteId: number;
  conductorId: number;
  id: number;
  conductorNombre: string;
  mensajeId: number;
  mensaje: string;
  tituloMensaje: number;
  coordenadaId: number;
  coordenadaNombre: string;
  eventoId: number;
  eventoNombre: string;
  rutaId: number;
  rutaNombre: string;

  patente: string;
  latitud: string;
  longitud: string;
  linkMapa: string;
  fechaTxt: string;
  velocidadActual: number;
};

export type filtros = {
  idEvento: number;
  fechaDesde: number;
  fechaHasta: number;
  stringBusqueda: string;
};
