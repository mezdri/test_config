import moment from 'moment';
import { ActividadesCorrectivas } from '../Correctivas/Data/Correctiva';

export type HistoricoCorrectivo = {
  correctivosHistoricos: HistoricosCorrectivosList[];
  patente: string;
  costoTotalMantenimientos: number;
  costoTotalCorrectiva: number;
};

export type HistoricosCorrectivosList = {
  id: number;
  nombre: string;
  fechaRealizacion: moment.Moment;
};
