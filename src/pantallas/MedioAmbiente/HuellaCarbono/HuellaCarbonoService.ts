import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { string } from 'yup';
import { MSResponse } from '@/interfaces/MS';
import { VehiculoFilterI } from '@/interfaces/Filters';

export class HuellaCarbonoService {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  get_data_general(clientId: string, body: any): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/huella_carbono/get_data_general',
      {
        clientId: clientId || '',
        body: body || '',
      }
    );
  }

  get_marcas(clientId: string): AxiosPromise {
    return this.axios.http.post('Metabase/PostgenericA/huella_carbono/marcas', {
      clientId: clientId || '',
    });
  }

  get_modelos(clientId: string, marca: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/huella_carbono/modelos',
      {
        clientId: clientId || '',
        marca: marca || '',
      }
    );
  }

  save_vehiculo(data: any): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/huella_carbono/save_data',
      {
        data: data || '',
      }
    );
  }
}
