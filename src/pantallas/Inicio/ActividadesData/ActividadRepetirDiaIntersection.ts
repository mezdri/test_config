import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';

type KeysNotFoundInRepetirDia = 'idInterno' | 'extendida';
export interface ActividadRepetirDiaIntersection
  extends Omit<Actividad, KeysNotFoundInRepetirDia>,
    Partial<Pick<Actividad, KeysNotFoundInRepetirDia>> {}
