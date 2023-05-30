import moment from 'moment';

export type FacturaDetalle = {
  folio?: number;
  nombre?: string;
  rut?: string;
  direccion?: string;
  giro?: string;
  fechaEmision?: moment.Moment;
  condicionPago?: string;
  totalIva?: number;
  totalNeto?: number;
  total?: number;
  detalles?: [
    {
      nroLinea?: number;
      nombreItem?: string;
      precioItem?: number;
      cantidadItem?: number;
      montoItem?: number;
      descuento?: number;
    }
  ];
};

// export type ListaFactura = {
//   tipoDocumento?: string;
//   numero?: string;
//   fechaEmision?: moment.Moment;
//   fechaVencimiento?: moment.Moment;
//   condicionPago?: string;
//   estado?: string;
// };

//   id?: number;
//   rut?: string;
//   nombre?: string;
//   direccion?: string;
//   comercialNombre?: string;
//   comercialTelefono?: string;
//   comercialEmail?: string;
//   tecnicoNombre?: string;
