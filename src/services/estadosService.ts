import { EstadoEntidad } from '@/config/enums';
import { EstadoInterface } from '@/interfaces/Estado';
export class EstadosService {
  getEstados(): EstadoInterface[] {
    let estados = [];
    for (let item in EstadoEntidad) {
      if (!isNaN(Number(item))) {
        let estado = EstadoEntidad[item];
        estados.push({
          id: Number(item),
          nombre: estado,
        });
      }
    }
    return estados;
  }
  getEstadosVisibles(): EstadoInterface[] {
    let estados = [];
    for (let item in EstadoEntidad) {
      if (!isNaN(Number(item))) {
        let estado = EstadoEntidad[item];
        estados.push({
          id: Number(item),
          nombre: estado,
        });
      }
    }

    return estados
      .filter(x => x.id == 0 || x.id == 1)
      .sort(function(vote1, vote2) {
        if (vote1.nombre > vote2.nombre) return 1;
        if (vote1.nombre < vote2.nombre) return -1;
      });
  }
}
