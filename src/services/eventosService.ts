import { EstadoAuditoria } from '@/config/enums';
import { EstadoInterface } from '@/interfaces/Estado';
export class EventosService {
  getEventos(): EstadoInterface[] {
    let estados = [];
    for (let item in EstadoAuditoria) {
      if (!isNaN(Number(item))) {
        let estado = EstadoAuditoria[item];
        estados.push({
          id: Number(item),
          nombre: estado,
        });
      }
    }
    return estados;
  }
}
