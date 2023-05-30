import { IRanking } from '@/interfaces/DashboardEsmax/RankingClass';
import {
  IEstadoDisp,
  EstadoDispositivosClass,
} from '@/interfaces/DashboardEsmax/EstadoDispositivosClass';
import { ISello } from '@/interfaces/DashboardEsmax/SellosClass';

interface IDashboardEsquema {
  cod: string;
  estructura: any;
  label: string;
  urlFiltros: string;
  urlDashboard: string;
  seleccion: any[];
}

export class EsquemaDashboard {
  esquema: IDashboardEsquema;
  estado = new EstadoDispositivosClass();

  constructor() {
    this.esquema = {
      cod: '',
      estructura: this.estado.estado,
      label: '',
      urlFiltros: '',
      urlDashboard: '',
      seleccion: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
}
