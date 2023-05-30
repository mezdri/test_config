export interface IEstadoDisp {
  user_id: number;
  id_cliente: number;
  fini: string;
  ffin: string;
  nom_plataforma: string[];
  nom_flota: string[];
  grupo: string[];
  tipo_vehiculo: string[];
  nom_ruta: string[];
  tipo_dispositivo: string[];
  estado_vehiculos: string[];
  nom_transportista: string[];
  patente_vehiculo: string[];
  nom_sitio: string[];
}

export class EstadoDispositivosClass {
  estado: IEstadoDisp;

  constructor() {
    this.estado = {
      user_id: null,
      id_cliente: null,
      fini: '',
      ffin: '',
      nom_plataforma: [],
      nom_flota: [],
      grupo: [],
      tipo_vehiculo: [],
      nom_ruta: [],
      nom_transportista: [],
      patente_vehiculo: [],
      estado_vehiculos: [],
      tipo_dispositivo: [],
      nom_sitio: [],
    };
  }
  //   getNombrePorIdPlataformas(id: number) {
  //     let value = this.plataformas.find((post, index) => {
  //       if (post.id === id) return true;
  //     });
  //     return value.nombre;
  //   }
}
