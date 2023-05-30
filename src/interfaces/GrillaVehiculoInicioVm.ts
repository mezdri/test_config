import { HomeFiltros } from '@/config/enums';

export class GrillaVehiculoInicioVm {
  clienteId?: number;
  usuarioId?: number;
  filtro?: HomeFiltros;
  elementosSeleccionados?: number[];
  request?: any;
}
