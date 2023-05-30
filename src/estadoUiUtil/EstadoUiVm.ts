import { Funcionalidades } from '@/config/funcionalidades';
import { HomeFiltros } from '@/config/enums';
export class EstadoUiVm {
  id?: number;
  componente?: string;
  clienteId?: number;
  usuarioId?: number;
  funcionalidades?: Funcionalidades;
  objeto?: any;
}

export class Coordenadas {
  lat: number;
  lng: number;
}

export class EstadoHomeUi {
  coordenadas: Coordenadas;
  zoom: number;
  filtro: HomeFiltros;
  elementosSeleccionados: any[];
  tipoMapa: any; //Tipo Mapa en el estadoUi del Home
  unidadSeleccionada: string; //Filtro Vehiculo Home
  grupoZonas: any[];
}
