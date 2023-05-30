export interface ITiempoEstado {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  nom_plataforma: string;
  nom_flota: string[];
  grupo: string[];
  tipo_vehiculo: string[];
  patente_vehiculo: string[];
  nom_sitio: string[];
  nom_transportista: string[];
  tipo_sitio: string[];
}

export class TiempoEstadiaClass {
  estado: ITiempoEstado;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      nom_plataforma: '',
      grupo: [],
      nom_flota: [],
      tipo_vehiculo: [],
      patente_vehiculo: [],
      nom_sitio: [],
      nom_transportista: [],
      tipo_sitio: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
  //     let value = this.plataformas.find((post, index) => {
  //       if (post.id === id) return true;
  //     });
  //     return value.nombre;
  //   }
}
