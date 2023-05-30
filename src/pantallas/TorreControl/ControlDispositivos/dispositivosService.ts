import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { StringStream } from 'codemirror';
import { string } from 'yup';
import { MSResponse } from '@/interfaces/MS';
import { VehiculoFilterI } from '@/interfaces/Filters';
import { VehiculoRequestI } from '@/pantallas/Conecta/ClasificacionPatentes/ClasificacionPatentesInterfaces';

export class DispositivosService {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getDispositivos(
    clientId: string,
    vehiculoId: string,
    ignicion: string
  ): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_dispositivos_control',
      {
        clientId: clientId || '',
        vehiculoId: vehiculoId || '',
        ignicion: ignicion || '',
      }
    );
  }

  getInfoVehiculo(
    clientId: string,
    vehiculoId: string,
    avl: string
  ): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_infoVehiculo',
      {
        clientId: clientId || '',
        vehiculoId: vehiculoId || '',
        avl: avl || '',
      }
    );
  }

  getVehiculos(
    codFlota: any,
    filter = '',
    userId: number,
    clientId: string
  ): AxiosPromise<MSResponse<VehiculoFilterI>> {
    const body: any = {
      cod_flota: codFlota,
      user_id: userId.toString(),
      clientId: clientId,
    };
    if (filter) body['filter'] = filter;
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_vehicles',
      body
    );
  }

  getVehiculoId(clientId: string, patente: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/get_vehiculoId',
      {
        clientId: clientId || '',
        patente: patente || '',
      }
    );
  }

  getLastLocation(clientId: string, patente: string): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/control_tower/getLastLocation',
      {
        clientId: clientId || '',
        patente: patente || '',
      }
    );
  }

  getCertificadoPdf(
    clientId: string,
    patente: string,
    dataDispositivos: any,
    tipo: string
  ): AxiosPromise {
    return this.axios.http.post(
      'Metabase/PostgenericA/certificados/generatePDF',
      {
        token_torre: 'Tc-Dispositivos-APeJSaswKd6eohXEJsCH5pc' || '',
        clientId: clientId || '',
        patente: patente || '',
        dispositivos: dataDispositivos || '',
        tipo: tipo || '',
      }
    );
  }
}
