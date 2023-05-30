export interface IDatosSertec {
  nro_caso: string;
  transportista: string;
  planta: string;
  patente: string;
  producto: string;
  fecha_origen_falla: string;
  fecha_apertura_ticket: string;
  fecha_coordinacion_trabajos: string;
  fecha_solucion_definitiva: string;
  horas_o_dias_en_solucion: number;
  tipo_caso: string;
  estado: string;
  motivo_rechazo: string;
  comentario: string;
  id_cliente: number;
  segmentacion: string;
}

export class DatosSertecClass {
  datos: IDatosSertec;

  constructor() {
    this.datos = {
      nro_caso: '',
      transportista: '',
      planta: '',
      patente: '',
      producto: '',
      fecha_origen_falla: '',
      fecha_apertura_ticket: '',
      fecha_coordinacion_trabajos: '',
      fecha_solucion_definitiva: '',
      horas_o_dias_en_solucion: null,
      tipo_caso: '',
      estado: '',
      motivo_rechazo: '',
      comentario: '',
      id_cliente: null,
      segmentacion: '',
    };
  }
}
