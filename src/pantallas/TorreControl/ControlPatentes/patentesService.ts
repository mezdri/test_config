import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { StringStream } from 'codemirror';

export class PatentesService {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getCuadratura(clientId: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_cuadratura',
      {
        clientId: clientId || '',
      }
    );
  }

  getDataCuadratura(clientId: string, body: any): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_data_json_cuadratura',
      {
        clientId: clientId || '',
        data: body || '',
      }
    );
  }

  exportCuadratura(clientId: string, userId: string, body: any): AxiosPromise {
    return this.axios.http.post('Metabase/PostgenericA/control_tower/export', {
      clientId: clientId || '',
      userId: userId || '',
      body: body || '',
    });
  }
}
