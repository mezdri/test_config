import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';

export class FlotaService {
  axios: AxiosVue;
  rutCliente: string = JSON.parse(window.localStorage.user).rutClienteDefecto
    ? JSON.parse(window.localStorage.user).rutClienteDefecto
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getFlotas(clientId: string, sumary: boolean): AxiosPromise {
    if (sumary == false) {
      return this.axios.http.post(
        'Metabase/PostgenericA/control_tower/get_flotas_control',
        {
          clientId: clientId || '',
        }
      );
    } else {
      return this.axios.http.post(
        'Metabase/PostgenericA/control_tower/get_flotas_with_sumary',
        {
          clientId: clientId || '',
        }
      );
    }
  }

  getVehiculosByFlota(cod_flota: string, clientId: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_vehiculos_by_flota',
      {
        clientId: clientId || '',
        rutCliente: this.rutCliente || '',
        cod_flota: cod_flota || '',
      }
    );
  }
}
