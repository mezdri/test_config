import moment from 'moment';

export type Solicitud = {
  idCaso: string;
  fechaCreacion: moment.Moment;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  idCategoria: string;
  categoria: string;
  idSubcategoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  fechaResolucion: moment.Moment;
  resolucion: string;
  estado: string;
  numeroResolucion: string;
};
