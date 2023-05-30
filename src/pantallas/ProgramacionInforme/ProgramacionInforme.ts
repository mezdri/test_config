import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import moment from 'moment';
import { number } from 'yup';
import { Calendario } from '@/pantallas/Calendarios/Calendario';

export const makeProgramacioninformePasos = (): PasosCrud => ({
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
  configurarNotificacion: {
    accion: 'Crear - Configurar Notificación',
    visible: true,
    step: 2,
    title: 'Configurar Notificación',
    icon: 'notifications',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
});

export type ProgramacionInforme = {
  id?: number;
  estado?: number;
  nombreServicio?: string;
  nombre: string;
  formato?: number;
  notificaBrowser?: boolean;
  notificaGps?: boolean;
  notificaEmail?: boolean;
  tipoInformeId: number;
  vehiculos?: number[];
  reporteProgramadoZona?: number[];
  periodo?: ReportePeriodo;
  actividadTipo?: number[];
  checkSateliteActividad?: boolean;
  checkHDOPActividad?: boolean;
  checkLongYLatActividad?: boolean;
  checkDatoValidoActividad?: boolean;
  checkResumenDetalle?: boolean;
  checkAgruparDiaDetalle?: boolean;
  checkResumenSitio?: boolean;
  checkTodoTipoSitio?: boolean;
  checkSateliteTemperatura?: boolean;
  checkHDOPTemperatura?: boolean;
  checkLongYLatTemperatura?: boolean;
  zonas?: number[];
  minimoDiasDetencion?: number;
  minimoTiempo?: any;
  velocidadMaxima?: number;
  planMantenimiento?: number[];
  filtros?: Filtros[];
  contactos?: number[];
  listasDistribucion?: number[];
  usuarios?: number[];
  calendarios?: number[];
  notificacionId?: number;
  proveedores?: number[];
  clienteProveedores?: number[];
  descargas?: number[];
  //Nuevos parámetros
  zonasNombre?: string[];
  tipoZona?: string;
  precisionHdop?: string;
  precisionSatelites?: string;
  tiempoDetencion?: number;
  diasDetencion?: string;
  horasDetencion?: string;
  minutosDetencion?: string;
  alertaBaseId?: number;
  alertaBaseCliente?: any;
  actividadesTiposNombre?: string[];
  columnasOcultas?: string[];
  columnasOcultasAlertas?: string[];
  limiteVelocidad?: number;
  mostrarSitioDetencion?: boolean;
  mostrarSitioDetalleViaje?: boolean;
  mostrarEtiquetasEVS?: boolean;
};

export type ProgramacionInformeBackend = {
  id?: number;
  estado?: number;
  nombreServicio?: string;
  nombre: string;
  formato?: number;
  notificaBrowser?: boolean;
  notificaGps?: boolean;
  notificaEmail?: boolean;
  tipoInformeId: number;
  vehiculos?: number[];
  reporteProgramadoZona?: number[];
  periodo?: ReportePeriodo;
  actividades?: number[];
  checkHDOPActividad?: boolean;
  checkLongYLatActividad?: boolean;
  checkDatoValidoActividad?: boolean;
  checkResumenDetalle?: boolean;
  checkAgruparDiaDetalle?: boolean;
  checkResumenSitio?: boolean;
  checkTodoTipoSitio?: boolean;
  checkSateliteTemperatura?: boolean;
  checkHDOPTemperatura?: boolean;
  checkLongYLatTemperatura?: boolean;
  zonas?: number[];
  minimoDiasDetencion?: number;
  minimoTiempo?: any;
  velocidadMaxima?: number;
  planMantenimientos?: number[];
  filtros?: Filtros[];
  multiploDias?: number;
  multiploMes?: number;
  multiploSemanas?: number;
  proveedores?: number[];
  clienteProveedores?: number[];
  descargas?: number[];
  //Nuevos parámetros
  zonasNombre?: string[];
  tipoZona?: string;
  precisionHdop?: string;
  precisionSatelites?: string;
  tiempoDetencion?: number;
  diasDetencion?: string;
  horasDetencion?: string;
  minutosDetencion?: string;
  alertaBaseId?: number;
  alertaBaseCliente?: any;
  actividadesTipos?: string[];
  columnasOcultas?: string[];
  columnasOcultasAlertas?: string[];
  limiteVelocidad?: number;
  mostrarSitioDetencion?: boolean;
  mostrarSitioDetalleViaje?: boolean;
  mostrarEtiquetasEVS?: boolean;
};

export type Filtros = {
  reporteFiltroId?: number;
  value: boolean | number;
};

export type ReportePeriodo = {
  id?: number;
  horaDesde?: string;
  horaHasta?: string;
  periodoDesde?: moment.Moment;
  periodoHasta?: moment.Moment;
  multiploPeriodo?: number;
  multiploDias?: number;
  multiploMes?: number;
  multiploSemanas?: number;
  tipo?: number;
};

export type Notificacion = {
  id: number;
  contactos: Contactos[];
  listaDistribuciones: ListaDistribucion[];
  usuarios: any[];
  calendarios: Calendario[];
};

export type Contactos = {
  id: number;
  nombre: string;
  tipo: string;
};

export type ListaDistribucion = {
  id: number;
  nombre: string;
  tipo: string;
};
