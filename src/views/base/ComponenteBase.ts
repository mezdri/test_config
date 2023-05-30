import Vue from 'vue';
import { Funcionalidades } from '@/config/funcionalidades';
import store from '@/store';
import router from '@/router';
import config from '@/config/index';
import { Component } from 'vue-property-decorator';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { LoadingService } from '@/services/loadingService';
import { AccionesUsuario, PermisoAccion } from '@/views/base/VariablesPermisos';
import { number } from 'yup';

// TODO declarar todas las posibles acciones MenuItem
export type Accion =
  | 'Crear - Información General'
  | 'Editar - Información General'
  | 'Ver Detalle - Información General'
  | 'Consultar'
  | 'Eliminar'
  | 'Exportar'
  | 'Importar'
  | 'Ver Detalle'
  | 'Ver Detalle - Asociar Actividades'
  | 'Ver Detalle - Asociar Plan de Mantención'
  | 'Crear - Asociar Actividades'
  | 'Crear - Asociar Plan de Mantención'
  | 'Editar - Asociar Actividades'
  | 'Editar - Asociar Plan de Mantención'
  | 'Editar - Asociar Lista de Distribución'
  | 'Ver Detalle - Asociar Lista de Distribución'
  | 'Crear - Asociar Lista de Distribución'
  | 'Editar - Seleccionar Códigos'
  | 'Editar - Agregar Campos'
  | 'Editar - Script Validación Actividad'
  | 'Editar - Script Validacion Actividad Extendida'
  | 'Editar - HTML Template'
  | 'Ver Detalle - Seleccionar Códigos'
  | 'Ver Detalle - Agregar Campos'
  | 'Ver Detalle - Script Validación Actividad'
  | 'Ver Detalle - Script Validacion Actividad Extendida'
  | 'Ver Detalle - HTML Template'
  | 'Crear - Seleccionar Códigos'
  | 'Crear - Agregar Campos'
  | 'Crear - Script Validación Actividad'
  | 'Crear - Script Validacion Actividad Extendida'
  | 'Crear - HTML Template'
  | 'Crear - Buscar Vehiculo'
  | 'Crear - Informacion Recalibracion'
  | 'Editar - Buscar Vehiculo'
  | 'Editar - Informacion Recalibracion'
  | 'Ver Detalle - Buscar Vehiculo'
  | 'Ver Detalle - Informacion Recalibracion'
  | 'Ver Detalle - Asociar Pauta y Frecuencia'
  | 'Ver Detalle - Configurar Notificación'
  | 'Ver Detalle - Asociar Flotas Etiquetas o Vehiculos'
  | 'Crear - Asociar Pauta y Frecuencia'
  | 'Crear - Configurar Notificación'
  | 'Crear - Asociar Flotas Etiquetas o Vehiculos'
  | 'Editar - Asociar Pauta y Frecuencia'
  | 'Editar - Configurar Notificación'
  | 'Editar - Asociar Flotas Etiquetas o Vehiculos'
  | 'Crear - Asociar Cliente Proveedor'
  | 'Editar - Asociar Cliente Proveedor'
  | 'Ver Detalle - Asociar Cliente Proveedor'
  | 'Crear - Asociar Proveedor'
  | 'Editar - Asociar Proveedor'
  | 'Ver Detalle - Asociar Proveedor'
  | 'Ver Detalle - Detalle Factura'
  | 'Imprimir'
  | 'Descargar'
  | 'VerPdf';

// @ts-ignore
@Component
export abstract class ComponenteBase extends Vue {
  abstract funcionalidad: Funcionalidades = null;

  abstract accionesTotales: PermisoAccion[] = [];

  // Vuex Store
  usuario: any = store.state.user;
  usuarioId: number = store.state.userId;

  //Axios
  readonly controllerModuloAccion: string = 'ModuloAccion';
  axiosModuloAccion: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  // Globales
  $snotify: any;
  clienteId: number = config.getClienteSesion();
  readonly loadingService = new LoadingService();

  // tipos
  AccionesCargadas: AccionesUsuario[] = [];
  PermisosAsignados: PermisoAccion[] = [];

  constructor() {
    super();
  }

  // Accion consultar
  chequearPermisoConsultar() {
    this.AccionesCargadas = this.usuario.permisosUsuario;

    const Modulo: AccionesUsuario = this.AccionesCargadas.find(
      (x: AccionesUsuario) =>
        x.moduloCodigo === this.funcionalidad && x.clienteId === this.clienteId
    );

    if (Modulo === undefined || Modulo === null) {
      router.replace('/');
    }
  }

  chequearPermiso(nombrePermiso: string): boolean {
    const accion: AccionesUsuario = this.AccionesCargadas.find(
      (x: AccionesUsuario) =>
        x.moduloCodigo === this.funcionalidad &&
        x.nombreAccion.trim() === nombrePermiso.trim() &&
        x.clienteId === this.clienteId
    );

    return accion !== undefined && accion !== null;
  }

  chequearPermisosUsuario(): void {
    for (let i: number = 0; i < this.accionesTotales.length; i++) {
      const accion: PermisoAccion = this.accionesTotales[i];

      let permiso = this.AccionesCargadas.find(
        x =>
          x.moduloCodigo === this.funcionalidad &&
          x.accionCodigo === accion.accionCodigo
      );

      if (permiso !== undefined) {
        accion.visible = true;
      } else {
        accion.visible = false;
      }
    }
  }

  chequearPermisoFull(accionCodigo: number, funcionalidad: number): boolean {
    try {
      let permisoUsuario = this.usuario.permisosUsuario.filter(
        (x: any) =>
          x.clienteId === this.clienteId &&
          x.accionCodigo === accionCodigo &&
          x.moduloCodigo === funcionalidad
      );

      // console.log('permisoUsuario', permisoUsuario);
      if (permisoUsuario.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return true;
    }
  }

  created(): void {
    this.chequearPermisoConsultar();
  }

  mounted() {
    this.chequearPermisosUsuario();
    document
      .querySelector('.v-dialog__content > .v-dialog--fullscreen')
      .addEventListener('click', this.handleFullscreenModalClick);
  }

  /**
   * los ag-menu de los modales no se cerraban al hacer click.
   */
  handleFullscreenModalClick() {
    const menuAgGrid = document.querySelector('.ag-menu > .ag-menu-list');
    if (menuAgGrid) {
      menuAgGrid.parentElement.remove();
    }
  }
}
