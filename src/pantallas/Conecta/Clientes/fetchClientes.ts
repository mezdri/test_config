import { AxiosVue } from '../../../AxiosVue';
import { ServicioProxy } from '../../../config/enums';
import { AxiosPromise } from 'axios';
import { string } from 'yup';

export class fetchClientes {
  axios: AxiosVue;
  user_id: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  updateCliente(cliente: any): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/conectaClientes/updateCliente',
      {
        cliente: cliente,
        user_id: this.user_id,
      }
    );
  }
}
