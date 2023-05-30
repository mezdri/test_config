import { object } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CertificadoBaseCliente } from '@/interfaces/Certificados';

import moment from 'moment';

type HttpResponseBody = CertificadoBaseCliente;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('CertificadosBase/' + id + '/GetDetalleCertificado');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): CertificadoBaseCliente => {
  try {
    const maybeCertificados = axiosResponse.data;
    return maybeCertificados;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidCertificado = (
  certificados: CertificadoBaseCliente
): Promise<CertificadoBaseCliente | null> => {
  return schema
    .isValid(certificados, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? certificados : null));
};

const parseAlerta = (x: CertificadoBaseCliente): CertificadoBaseCliente => ({
  id: x.id,
  nombre: x.nombre,
  estado: x.estado,
  tipoCertificadoId: x.tipoCertificadoId,
  firmaCertificadoId: x.firmaCertificadoId,
  contenido: x.contenido,
  jsonConfig: x.jsonConfig,
});

export const fetchByIdCertificado = (id: number) =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValidCertificado)
    .then(parseAlerta);
