import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { boolean } from 'yup';

// CertificadoBaseBasePostVm
export type CertificadoBaseBackend = {
  id?: number;
  nombre?: string;
  estado?: number;
  jsonConfig?: string;
  tipoCertificadoId?: number;
  firmaCertificadoId?: number;
  tipoCertificado?: string;
  firmaCertificado?: string;
  usuarioCreadorTxt?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionTxt?: string;
  fechaModificacion?: moment.Moment;
};

export type CertificadoBaseCliente = {
  id?: number;
  nombre?: string;
  estado?: number;
  jsonConfig?: string;
  tipoCertificadoId?: number;
  firmaCertificadoId?: number;
  contenido?: Contenido;
};

export type TiposCertificadosBackend = {
  id?: number;
  nombre?: string;
};

export type FirmasCertificadosBackend = {
  id?: number;
  nombre?: string;
};

export type InformacionVehiculo = {
  visible?: boolean;
  marca?: Marca;
  modelo?: Modelo;
  anio?: Anio;
  tipoVehiculo?: TipoVehiculo;
};

export type Marca = {
  visible?: boolean;
  requerido?: boolean;
};

export type Modelo = {
  visible?: boolean;
  requerido?: boolean;
};

export type Anio = {
  visible?: boolean;
  requerido?: boolean;
};
export type TipoVehiculo = {
  visible?: boolean;
  requerido?: boolean;
};

export type InformacionGps = {
  visible?: boolean;
  serie?: Serie;
  tipoGps?: TipoGps;
};

export type Serie = {
  visible?: boolean;
  requerido?: boolean;
};

export type TipoGps = {
  visible?: boolean;
  requerido?: boolean;
};

export type Anexo = {
  visible?: boolean;
  contenido?: string;
};

export type Texto = {
  glosa?: string;
  activo?: boolean;
  anexo?: string;
};

export type Gps = {
  datosGps?: boolean;
  serieGps?: boolean;
  tipoGps?: boolean;
  datosVehiculo?: boolean;
  marca?: boolean;
  modelo?: boolean;
  anio?: boolean;
  tipovehiculo?: boolean;
};

export type Contenido = {
  informacionVehiculo?: InformacionVehiculo;
  informacionGps?: InformacionGps;
  anexo?: Anexo;
  codigoQr?: boolean;
  glosa?: string;
  fechaExpiracion?: boolean;
  logoTercero?: any;
};

export const makepasosCertificadoBaseCrear = (): PasosCrud => ({
  configurarCertificado: {
    accion: 'Crear - Certificado Base',
    visible: true,
    step: 1,
    title: 'Certificado Base',
    icon: 'code',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 40,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  editarTexto: {
    accion: 'Crear - Editar Glosa & Anexo',
    visible: true,
    step: 2,
    title: 'Editar Glosa & Anexo',
    icon: 'text_fields',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },

    codigoSubAccion: 41,
    codigoAccionPadre: CodigoAccion.Crear,
  },
  gpsVehiculo: {
    accion: 'Crear - Editar Gps & Vehículo',
    visible: true,
    step: 3,
    title: 'Datos Gps & Vehículo',
    icon: 'directions_car',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 42,
    codigoAccionPadre: CodigoAccion.Crear,
  },
});

export const makepasosCertificadoBaseEditar = (): PasosCrud => ({
  configurarCertificado: {
    accion: 'Crear - Certificado Base',
    visible: true,
    step: 1,
    title: 'Certificado Base',
    icon: 'code',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 40,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  editarTexto: {
    accion: 'Crear - Editar Glosa & Anexo',
    visible: true,
    step: 2,
    title: 'Editar Glosa & Anexo',
    icon: 'text_fields',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },

    codigoSubAccion: 41,
    codigoAccionPadre: CodigoAccion.Editar,
  },
  gpsVehiculo: {
    accion: 'Crear - Editar Gps & Vehículo',
    visible: true,
    step: 3,
    title: 'Datos Gps & Vehículo',
    icon: 'directions_car',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 42,
    codigoAccionPadre: CodigoAccion.Editar,
  },
});

export const makeAlertasBaseVerDetalle = (): PasosCrud => ({
  configurarCertificado: {
    accion: 'Ver Detalle - Certificado Base',
    visible: true,
    step: 1,
    title: 'Certificado Base',
    icon: 'code',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
    codigoSubAccion: 40,
    codigoAccionPadre: 4,
  },
  editarTexto: {
    accion: 'Ver Detalle - Editar Glosa & Anexo',
    visible: true,
    step: 2,
    title: 'Editar Glosa & Anexo',
    icon: 'text_fields',
    codigoSubAccion: 60,
    codigoAccionPadre: 4,
  },
  gpsVehiculo: {
    accion: 'Ver Detalle - Editar Gps & Vehículo',
    visible: true,
    step: 3,
    title: 'Editar Gps & Vehículo',
    icon: 'spellcheck',
    codigoSubAccion: 62,
    codigoAccionPadre: 4,
  },
});
