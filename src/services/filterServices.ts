import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  ClientFilterI,
  FlotaFilterI,
  VehiculoFilterI,
} from '@/interfaces/Filters';
import { MSResponse } from '@/interfaces/MS';
import { AxiosPromise } from 'axios';
import { string } from 'yup';
import { VehiculoRequestI } from '@/pantallas/Conecta/ClasificacionPatentes/ClasificacionPatentesInterfaces';

export class FilterService {
  axios: AxiosVue;
  user_id: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getClients(filter: string): AxiosPromise<MSResponse<ClientFilterI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/searchFilter/get_clients',
      { filter }
    );
  }

  getFlota(
    avl: string,
    clientRut: string,
    filter: string
  ): AxiosPromise<MSResponse<FlotaFilterI>> {
    console.log(JSON.parse(this.user_id).id);
    return this.axios.http.post(
      'Metabase/PostgenericA/searchFilter/get_flotas',
      {
        avl,
        user_id: this.user_id,
        client_rut: clientRut,
        filter,
      }
    );
  }

  getPatentes(
    avl: string,
    clientRut: string,
    filter: string
  ): AxiosPromise<MSResponse<FlotaFilterI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/searchFilter/get_patentes',
      {
        avl,
        user_id: this.user_id,
        client_rut: clientRut,
        filter,
      }
    );
  }
}
