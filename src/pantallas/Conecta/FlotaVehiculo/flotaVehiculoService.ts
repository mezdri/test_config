import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FilterI } from '@/interfaces/Filters';
import { MSResponse } from '@/interfaces/MS';
import { AxiosPromise } from 'axios';
import { StringStream } from 'codemirror';
import { FlotaVehiculoInterface } from './FlotaVehiculoInterface';

export class FlotaVehiculoService {
  axios: AxiosVue;
  user_id: string = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')).id
    : '';

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getFlotaVehiculos(
    filter: FilterI
  ): AxiosPromise<MSResponse<FlotaVehiculoInterface>> {
    const data = {
      user_id: this.user_id,
      flotaCode: filter.flota.id || '',
      patente: filter.patente || '',
    };
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/get_vehiculos_flota',
      data
    );
  }

  assignFlota(filter: FilterI): AxiosPromise<MSResponse<any>> {
    // Se usa en este caso any ya que no se necesita un tipo para esta respuesta
    return this.axios.http.post('Metabase/PostgenericA/conecta/assign_flota', {
      rut: filter.client.rut,
      cod_flota: filter.flota.id,
      nom_flota: filter.flota.nombre,
      user_id: this.user_id,
    });
  }
  assignVehicle(
    rut: String,
    vehiculo: FlotaVehiculoInterface
  ): AxiosPromise<MSResponse<any>> {
    // Se usa en este caso any ya que no se necesita un tipo para esta respuesta
    return this.axios.http.post(
      'Metabase/PostgenericA/conecta/assign_vehicle',
      {
        patente: vehiculo.patente_vehiculo,
        rut,
        cod_flota: vehiculo.cod_flota,
        cod_vehiculo: vehiculo.cod_vehiculo,
        user_id: this.user_id,
      }
    );
  }
}
