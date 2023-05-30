import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { CertificadosBackend } from '@/interfaces/Certificados';

type HttpResponseBody = CertificadosBackend;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('CertificadosBase/GridClientSide'); //Llamada a Servicio
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): CertificadosBackend[] => {
  try {
    const maybeCertificados = axiosResponse.data;
    return maybeCertificados instanceof Array ? maybeCertificados : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  tipoCertificado: string().ensure(),
  firmaCertificado: string().ensure(),
  usuarioCreadorTxt: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacionTxt: string().ensure(),
  fechaModificacion: string().ensure(),
  estadoTxT: string().ensure(),
});

const getMaybeValidCertificados = (
  certificados: CertificadosBackend
): Promise<CertificadosBackend | null> => {
  return schema
    .isValid(certificados, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? certificados : null));
};

const parseCertificados = (x: CertificadosBackend): CertificadosBackend => ({
  id: x.id,
  nombre: x.nombre,
  tipoCertificado: x.tipoCertificado,
  firmaCertificado: x.firmaCertificado,
  usuarioCreadorTxt: x.usuarioCreadorTxt,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacionTxt: x.usuarioModificacionTxt,
  fechaModificacion: moment(x.fechaModificacion),
  estadoTxt: x.estadoTxt,
});

export const fetchCertificados = (): Promise<CertificadosBackend[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (certificados): Promise<Array<any | null>> =>
        Promise.all(certificados.map(getMaybeValidCertificados))
    )
    .then(certificados => certificados.filter(x => x))
    .then(certificados => certificados.map(parseCertificados));
