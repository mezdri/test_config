import { DescargaActividad } from '@/pantallas/DescargaActividades/DescargaActividad';

export type DescargaActividadForm = Pick<
  DescargaActividad,
  | 'estado'
  | 'proveedor'
  | 'clienteProveedor'
  | 'usuario'
  | 'password'
  | 'fechaInicio'
  | 'fechaTermino'
  | 'maximoPeticionesDia'
  | 'maximoPeticionesHora'
  | 'maximoRegistrosBloque'
>;
