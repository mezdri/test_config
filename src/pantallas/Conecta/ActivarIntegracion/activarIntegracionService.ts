import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { MSResponse } from '@/interfaces/MS';
import { AxiosPromise } from 'axios';
import {
  ActivarIntegracionInterface,
  ConfigIntegracionInterface,
} from './activarIntegracionInterface';
import { string } from 'yup';

export class ActivarIntegracionService {
  axios: AxiosVue;
  params: any;
  user_id: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getRelacionVehiculo(
    rut: string,
    flota: string
  ): AxiosPromise<MSResponse<ActivarIntegracionInterface>> {
    rut === '' ? (this.params = {}) : (this.params = { rut: rut });
    flota === '' ? this.params : (this.params.flota = flota);
    this.params.user_id = this.user_id;
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_relacion_vehiculo',
      this.params
    );
  }

  updateRelacion(
    params: any
  ): AxiosPromise<MSResponse<ActivarIntegracionInterface>> {
    params.user_id = this.user_id;
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/update_relacion_vehiculo_flags',
      params
    );
  }

  // TODO en un future seguramente se tenga que mandar al cliente como parametro
  getIntegrationConfig(): AxiosPromise<MSResponse<ConfigIntegracionInterface>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_relacion_vehiculo_flags_config',
      { user_id: this.user_id }
    );
  }
}
