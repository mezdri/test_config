import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(
    `Metabase/PostgenericB/camaras/getAlertasCamaras`,
    body
  );
};

export const fetchAlertas = (body: any) => makeHttpRequest(body);

type MsFiles = {
  url: string;
  size: number;
  bucket: string;
};

export type AlertaGrilla = {
  fechaAlarma: string;
  fechaIngreso: string;
  patente: string;
  tipoAlerta: string;
  tipoAlertaOriginal: string;
  velocidad: string;
  evidencia: string;
  ubicacion: string;
  codFlota: number;
  flota: string;
  files: string;
  grupo: string;
  numActividad: string;
};

export type Alerta = {
  fechaAlarma: string;
  fechaIngreso: string;
  codVehiculo: number;
  codFlota: number;
  flota: string;
  patente: string;
  numActividad: string;
  alerta: string;
  tipoAlerta: string;
  tipoAlertaOriginal: string;
  latitud: string;
  longitud: string;
  files: Array<MsFiles>;
  velocidad: string;
  grupo: string;
};

export const parseAlerta = (alertas: any): Alerta => {
  return {
    fechaAlarma:
      alertas.fecha_evidencia == null
        ? alertas.fecha_alarma
        : alertas.fecha_evidencia,
    fechaIngreso: alertas.fecha_ingreso,
    codVehiculo: alertas.cod_vehiculo,
    codFlota: alertas.cod_flota,
    flota: alertas.flota,
    patente: alertas.patente,
    numActividad: alertas.num_actividad,
    alerta: alertas.alerta,
    tipoAlerta: alertas.tipo_alarma,
    tipoAlertaOriginal: alertas.tipo_alarma_original,
    latitud: alertas.latitud,
    longitud: alertas.longitud,
    files: alertas.files,
    velocidad: alertas.velocidad,
    grupo: alertas.grupo,
  };
};
