export interface IDeteccion {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  nom_plataforma: string;
  nomflota: string[];
  grupo: string[];
  patente: string[];
  transportista: string[];
}

export class DeteccionNoAutorizadaClass {
  estado: IDeteccion;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      nom_plataforma: '',
      grupo: [],
      nomflota: [],
      patente: [],
      transportista: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
  //     let value = this.plataformas.find((post, index) => {
  //       if (post.id === id) return true;
  //     });
  //     return value.nombre;
  //   }
}
