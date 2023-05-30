export interface IAlertas {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  alerta: string;
  nom_flota: string[];
  grupo: string[];
  tipo_vehiculo: string[];
  nom_conductor: string[];
  nom_sitio: string[];
  ruta: string[];
  nom_transportista: string[];
}

export class AlertasClass {
  estado: IAlertas;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      alerta: '',
      grupo: [],
      nom_flota: [],
      tipo_vehiculo: [],
      nom_sitio: [],
      nom_conductor: [],
      ruta: [],
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
