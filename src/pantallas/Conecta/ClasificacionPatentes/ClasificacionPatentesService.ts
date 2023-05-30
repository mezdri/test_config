import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { VehiculoFilterI } from '@/interfaces/Filters';
import { MSResponse } from '@/interfaces/MS';
import { AxiosPromise } from 'axios';
import { string } from 'yup';
import {
  CamaraRelacionadaI,
  DataAsociadaDispositivoI,
  DataClasificadaI,
  EsquemaFlotaI,
  FlotasI,
  VehiculoRequestI,
  Flotas,
} from './ClasificacionPatentesInterfaces';

export class ClasificacionPatentes {
  axios: AxiosVue;
  user_id: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getAlarmas(whitSchema = false): AxiosPromise<MSResponse<CamaraRelacionadaI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_registro_camaras',
      { whit_schema: whitSchema, user_id: this.user_id }
    );
  }

  getFlotasAsociadas(cod_flota: string): AxiosPromise<MSResponse<FlotasI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_flotas_asociadas',
      { id: cod_flota, user_id: this.user_id }
    );
  }

  getDataAsociadaDispositivo(
    cod_dispositivo: string
  ): AxiosPromise<MSResponse<DataAsociadaDispositivoI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_data_asociada_dispositivo',
      { id: cod_dispositivo, user_id: this.user_id }
    );
  }

  getEsquemaFlota(cod_flota: string): AxiosPromise<MSResponse<EsquemaFlotaI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_esquema_flota',
      { id: cod_flota, user_id: this.user_id }
    );
  }

  getEsquemaBD(): AxiosPromise<MSResponse<EsquemaFlotaI>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_esquema_flota',
      { user_id: this.user_id }
    );
  }

  getAllFlotas(): AxiosPromise<MSResponse<Flotas>> {
    return this.axios.http.post('Metabase/PostgenericA/conecta/getAllFlota', {
      user_id: this.user_id,
    });
  }

  getAllClientes(): AxiosPromise<MSResponse<Flotas>> {
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/getAllClientes',
      { user_id: this.user_id }
    );
  }

  getVehiculos(
    codFlota: string,
    filter = ''
  ): AxiosPromise<MSResponse<VehiculoFilterI>> {
    const body: VehiculoRequestI = {
      cod_flota: codFlota,
      user_id: this.user_id,
    };
    if (filter) body['filter'] = filter;
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_vehicles',
      body
    );
  }

  postDataClasificada(
    data: DataClasificadaI
  ): AxiosPromise<MSResponse<FlotasI>> {
    data.user_id = this.user_id;
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/post_flota_clasificada',
      data
    );
  }
  postDataConfig(data: DataClasificadaI): AxiosPromise<MSResponse<FlotasI>> {
    data.user_id = this.user_id;
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/post_conf_camara',
      data
    );
  }
}
