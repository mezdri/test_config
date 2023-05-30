import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  idcliente: string,
  estado: string,
  id_user: string,
  patente: string,
  fechaInicio: string,
  fechaFin: string
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/track/getSertecSucursal`, {
    idcliente: idcliente,
    estado: estado,
    id_user: id_user,
    origen: window.location.origin,
    patente: patente,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  });
};
export const fetchSertec = (
  idcliente: string,
  estado: string,
  id_user: string,
  patente: string,
  fechaInicio: string,
  fechaFin: string
) =>
  makeHttpRequest(idcliente, estado, id_user, patente, fechaInicio, fechaFin);

export const getEstadosSertec = (): AxiosPromise<
  getDashboardHtttpResponseBody
> => {
  return axios.http.post(
    `Metabase/PostgenericA/track/getEstadosSertecSucursal`,
    {
      origen: window.location.origin,
    }
  );
};
