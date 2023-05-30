import moment from 'moment';

export type ListaDistribucion = {
  id: number;
  nombre: string;
  descripcion: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  estado?: boolean;
  estadoTxt: string;
  checked?: boolean;
  totalAsociados?: number;
};

export type ListaDistribucionNueva = {
  id?: ListaDistribucion['id'];
  nombre: ListaDistribucion['nombre'];
  estado?: ListaDistribucion['estado'];
  descripcion?: string;
  listaTodosServ?: ContactoAsociado[];
};

export type ListaDistribucionAsociacion = ListaDistribucionNueva & {
  contactos: ContactoAsociado[];
};

export type ContactoAsociado = {
  id: number;
  nombre: string;
  tipoText: string;
  estado?: string;
  correo: string;
};
