import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { string } from 'yup';

export class CertificadosServices {
  axios: AxiosVue;

  constructor() {
    this.axios = new AxiosVue(ServicioProxy.Metabase);
  }

  getFlotas(id: string): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getFlotas',
      {
        clienteDefecto: id,
      }
    );
  }

  getPatentes(id: string): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getPatentes',
      {
        clienteDefecto: id,
      }
    );
  }

  getTypesTemplates(): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getTypesTemplatesSucursal',
      {}
    );
  }

  getTemplate(id_template: string): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getTemplateSucursal',
      { id_template: id_template }
    );
  }

  getDataByPatente(
    patente: string,
    id_cliente: string,
    rut_cliente: string
  ): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getDataByPatente',
      { patente: patente, id_cliente: id_cliente, rut_cliente: rut_cliente }
    );
  }

  getDataByFlota(
    flota: string,
    id_cliente: string,
    rut_cliente: string
  ): AxiosPromise<any> {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getDataByFlota',
      { id_flota: flota, id_cliente: id_cliente, rut_cliente: rut_cliente }
    );
  }

  postSaveCertificado(data: any) {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/saveCertificado',
      data
    );
  }

  getDispositivoGps(patente: any, id_cliente: string, rut_cliente: string) {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getDispositivoByPatente',
      { patente: patente, id_cliente: id_cliente, rut_cliente: rut_cliente }
    );
  }

  getEmpresas(user_id: any) {
    return this.axios.http.post(
      'Metabase/PostgenericA/sucursal_virtual_certificados/getNombreCliente',
      { id_cliente: user_id }
    );
  }
}
