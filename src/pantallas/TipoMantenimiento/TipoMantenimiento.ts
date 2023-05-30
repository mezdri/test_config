import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type TipoMantenimiento = {
  id?: number;
  nombre?: string;
  descripcion?: string;
  categoriaTipoMantenimiento?: number;
  estado?: number;
  usuarioCreador?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  categoriaTipoMantenimientoTxt?: string;
  estadoTxt?: string;
  totalAsociados: number;
};

export const makeTipoMantenimientoPasos = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
});
