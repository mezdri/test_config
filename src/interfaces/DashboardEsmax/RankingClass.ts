export interface IRanking {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  alerta: string[];
  nom_flota: string[];
  grupo: string[];
  tipo_vehiculo: string[];
  nom_conductor: string[];
  nom_sitio: string[];
  nom_transportista: string[];
}

export class RankingClass {
  estado: IRanking;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      alerta: [],
      nom_flota: [],
      grupo: [],
      tipo_vehiculo: [],
      nom_conductor: [],
      nom_sitio: [],
      nom_transportista: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
  //     let value = this.plataformas.find((post, index) => {
  //       if (post.id === id) return true;
  //     });
  //     return value.nombre;
  //   }
}
