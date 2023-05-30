import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { VehiculoFilterI } from '@/interfaces/Filters';

export class reporteService {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getVehiculos(
    userId: number,
    clientId: string
  ): AxiosPromise<MSResponse<VehiculoFilterI>> {
    const body: any = {
      user_id: userId.toString(),
      clientId: clientId,
    };
    return this.axios.http.post(
      'Metabase/PostgenericA/huella_carbono/get_vehicles',
      body
    );
  }

  saveReport(data: any): AxiosPromise {
    return this.axios.http.post('Metabase/PostgenericA/huella_carbono/report', {
      payloads: data || '',
    });
  }
}
