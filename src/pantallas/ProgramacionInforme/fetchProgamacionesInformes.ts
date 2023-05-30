import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type ProgramacionInformesBackend = {
  tipoInforme: string;
  ultimoEnvio: moment.Moment;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  estadoTxt: string;
  usuarioCreacion: string;
  fechaCreacion: moment.Moment;
  id: number;
  nombre: string;
  detalleError: string;
  formatoTxt?: string;
  estadoEnvioTxt?: string;
  FiltrosAdicionales?: any;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('InformeProgramado');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): ProgramacionInformesBackend[] => {
  try {
    const maybeTaller = axiosResponse.data;
    return maybeTaller instanceof Array ? maybeTaller : [];
  } catch {
    return [];
  }
};

const schema = object({
  tipoInforme: string().ensure(),
  ultimoEnvio: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  estadoTxt: string().ensure(),
  usuarioCreacion: string().ensure(),
  fechaCreacion: string().ensure(),
  id: string().ensure(),
  nombre: string().ensure(),
  detalleError: string().ensure(),
  formatoTxt: string().ensure(),
  estadoEnvioTxt: string().ensure(),
});

const getMaybeValidProgramacion = (
  programacionInformes: ProgramacionInformesBackend
): Promise<ProgramacionInformesBackend | null> => {
  return schema
    .isValid(programacionInformes, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? programacionInformes : null));
};

const parseProgramacionInformes = (
  x: ProgramacionInformesBackend
): ProgramacionesInformes => ({
  tipoInforme: x.tipoInforme,
  ultimoEnvio: moment(x.ultimoEnvio),
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModificacion: x.usuarioModificacion,
  estadoTxt: x.estadoTxt,
  usuarioCreacion: x.usuarioCreacion,
  fechaCreacion: moment(x.fechaCreacion),
  id: x.id,
  nombre: x.nombre,
  detalleError: x.detalleError,
  formatoTxt: x.formatoTxt,
  estadoEnvioTxt: x.estadoEnvioTxt,
  FiltrosAdicionales: x.FiltrosAdicionales,
});

export const fetchProgramacionesInformes = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (
        programacionInformes
      ): Promise<Array<ProgramacionInformesBackend | null>> =>
        Promise.all(programacionInformes.map(getMaybeValidProgramacion))
    )
    .then(programacionInformes => programacionInformes.filter(x => x))
    .then(programacionInformes =>
      programacionInformes.map(parseProgramacionInformes)
    );

export type ProgramacionesInformes = {
  tipoInforme: string;
  ultimoEnvio: moment.Moment;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  estadoTxt: string;
  usuarioCreacion: string;
  fechaCreacion: moment.Moment;
  id: number;
  nombre: string;
  detalleError: string;
  formatoTxt?: string;
  estadoEnvioTxt?: string;
  FiltrosAdicionales?: any;
};
