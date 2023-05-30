export type Solicitud = {
  titulo?: string;
  num_solicitud?: string;
  id_cliente?: string;
  razon_social?: string;
  rut?: string;
  ejecutivo?: string;
  tipo?: string;
  fecha_creacion?: string;
  descripcion?: string;
  estado?: string;
};

export type MsResponseSolicitud = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<Solicitud>;
};
