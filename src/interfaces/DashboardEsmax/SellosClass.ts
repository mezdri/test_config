export interface ISello {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  cod_flota: string[];
  flag_en_sitio: string[];
  estado_sello: string[];
  alerta: string[];
  nom_conductor: string[];
  nom_grupo: string[];
}

export class SellosClass {
  estado: ISello;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      cod_flota: [],
      flag_en_sitio: [],
      estado_sello: [],
      alerta: [],
      nom_conductor: [],
      nom_grupo: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
  //     let value = this.plataformas.find((post, index) => {
  //       if (post.id === id) return true;
  //     });
  //     return value.nombre;
  //   }
}
