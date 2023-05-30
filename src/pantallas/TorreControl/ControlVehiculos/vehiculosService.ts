import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { StringStream } from 'codemirror';

export class VehiculosService {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getVehiculos(clientId: string, flotaId: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_vehiculos_control',
      {
        clientId: clientId || '',
        flotaId: flotaId || '',
      }
    );
  }
}
