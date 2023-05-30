import { IRanking } from '@/interfaces/DashboardEsmax/RankingClass';
import { IEstadoDisp } from '@/interfaces/DashboardEsmax/EstadoDispositivosClass';
import { ISello } from '@/interfaces/DashboardEsmax/SellosClass';

interface IGraficosEsquema {
  data: any[];
  name: string;
  sts: string;
  tipo_grafico: string;
  total_registro: string;
}

export class EsquemaGraficos {
  esquema: IGraficosEsquema;

  constructor() {
    this.esquema = {
      data: [],
      name: '',
      sts: '',
      tipo_grafico: '',
      total_registro: '',
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
}
