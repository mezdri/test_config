import { ServicioProxy } from '@/config/enums';
import axios from 'axios';
import { AxiosPromise } from 'axios';
import { DataI, SolicitarClaveI } from './SolicitarClaveInterfaces';
import { AxiosVue } from '@/AxiosVue';

export class SolicitarClaveService {
  static postNewKey(): any {
    throw new Error('Method not implemented.');
  }
  constructor() {}

  postNewKey(body: any) {
    let axios = new AxiosVue(ServicioProxy.MS);
    return axios.http.post(`/track/solicitar_clave_sucursal`, { body });
  }
}
