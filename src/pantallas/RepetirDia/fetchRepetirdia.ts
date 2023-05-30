import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Rdia } from './dtoRepetirdia';

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (rd: Rdia): AxiosPromise<HttpResponseBody> => {
  return axios.http.post(
    'Metabase/PostGenericByBody',
    {
      strUrl: `repite_dia_track3?user=${rd.user}&client=${rd.client}&starting_date=${rd.starting_date}&vehicule_id=${rd.vehicule_id}&starting_hour=${rd.starting_hour}&ending_hour=${rd.ending_hour}&ending_date=${rd.ending_date}`,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

export const getmapa = (map: Rdia) => makeHttpRequest(map);
