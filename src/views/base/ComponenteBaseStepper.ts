import Vue from 'vue';
import { Funcionalidades } from '@/config/funcionalidades';
import store from '@/store';
import config from '@/config/index';
import { Component } from 'vue-property-decorator';
import { PermisoAccionVm } from './PermisoAccionVm';
import { SubAccion, CodigoAccion } from '@/views/base/VariablesPermisos';

// @ts-ignore
@Component
export abstract class ComponenteBaseStepper extends Vue {
  funcionalidad: Funcionalidades = null;
  abstract permisosTotales: PermisoAccionVm[] = [];
  abstract permisosActuales: PermisoAccionVm[] = [];
  usuarioPermisos: any = store.state.user;
  subAccionesUsuario: SubAccion[] = [];

  created() {
    this.subAccionesModulo();
  }

  subAccionesModulo() {
    this.subAccionesUsuario = [];
    this.usuarioPermisos.permisosUsuario
      .filter((x: any) => x.moduloCodigo === this.funcionalidad)
      .forEach((x: any) => {
        if (x.subAcciones.length > 0) {
          this.subAccionesUsuario.push(x.subAcciones);
        }
      });
  }

  chequearPermisos(): void {
    for (let i: number = 0; i < this.permisosTotales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosTotales[i];
      const permisoCheck = this.chequearAccion(permiso);
      if (permisoCheck) {
        this.permisosActuales.push(permiso);
      } else {
        permiso.visible = false;
        permiso.step = 0;
      }
    }

    for (let i: number = 0; i < this.permisosActuales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosActuales[i];
      let step: number = i + 1;

      permiso.visible = true;
      permiso.step = step;
    }
  }

  // chequear permisos para editar y ver detalle
  chequearPermisosEditarDetalle(): void {
    for (let i: number = 0; i < this.permisosTotales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosTotales[i];

      const permisoCheck = this.chequearAccion(permiso);
      if (permisoCheck) {
        this.permisosActuales.push(permiso);
      } else {
        permiso.visible = false;
      }
    }

    for (let i: number = 0; i < this.permisosActuales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosActuales[i];
      permiso.visible = true;
    }
  }

  chequearAccion(permiso: PermisoAccionVm): boolean {
    // console.log('permisossss', permiso);
    let resp: boolean = false;
    if (this.subAccionesUsuario.length > 0) {
      this.subAccionesUsuario.forEach((itemSubAccion: any) => {
        // console.log('itemSubAccion', itemSubAccion);
        for (let i = 0; i < itemSubAccion.length; i++) {
          if (
            itemSubAccion[i].codigoSubAccion === permiso.codigoSubAccion &&
            itemSubAccion[i].codigoAccionPadre === permiso.codigoAccionPadre
          ) {
            resp = true;
            break;
          }
        }
      });
    } else {
      return false;
    }
    return resp;
  }

  //se agrega metodo para llamar permisos de funcionalidades
  chequearPermisoFuncionalidades(nombrePermiso: string): boolean {
    const accion: any = this.usuarioPermisos.funcionalidades.find(
      (x: any) =>
        x.funcionalidadCodigo === this.funcionalidad &&
        x.accionNombre.trim() === nombrePermiso.trim() &&
        x.accionNombre.toLowerCase().includes(nombrePermiso.toLowerCase())
    );

    return accion !== undefined && accion !== null;
  }

  chequearPermisoInformes() {
    for (let i: number = 0; i < this.permisosTotales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosTotales[i];

      let permisoInforme = this.usuarioPermisos.permisosUsuario.find(
        (x: any) =>
          x.moduloCodigo === this.funcionalidad &&
          x.accionCodigo === permiso.codigoSubAccion
      );

      if (permisoInforme) {
        this.permisosActuales.push(permiso);
      } else {
        permiso.visible = false;
        permiso.step = 0;
      }
    }

    for (let i: number = 0; i < this.permisosActuales.length; i++) {
      let permiso: PermisoAccionVm = this.permisosActuales[i];
      let step: number = i + 1;

      permiso.visible = true;
      permiso.step = step;
    }
  }

  chequearPermisoFuncionalidad(
    nombrePermiso: string,
    funcionalidad: Funcionalidades
  ): boolean {
    const accion: any = this.usuarioPermisos.permisosUsuario.find(
      (x: any) =>
        x.funcionalidadCodigo === funcionalidad &&
        x.accionNombre.trim() === nombrePermiso.trim() &&
        x.accionNombre.toLowerCase().includes(nombrePermiso.toLowerCase())
    );

    return accion !== undefined && accion !== null;
  }

  //SE USA EN EL HOME
  chequearPermisoModuloAccion(
    codigoAccion: number,
    codigoModulo: Funcionalidades
  ): boolean {
    const accion: any = this.usuarioPermisos.permisosUsuario.find(
      (x: any) =>
        x.moduloCodigo === codigoModulo && x.accionCodigo === codigoAccion
    );

    return accion !== undefined && accion !== null;
  }

  chequearPermisoSubAccion(
    codigoAccionPadre: number,
    codigoSubAccion: number,
    codigoModulo: Funcionalidades
  ): boolean {
    const modulo: any = this.usuarioPermisos.permisosUsuario.find(
      (x: any) =>
        x.moduloCodigo === codigoModulo && x.accionCodigo === codigoAccionPadre
    );

    if (modulo !== undefined) {
      const subAcciones = modulo.subAcciones.find(
        (subAccion: any) =>
          subAccion.codigoAccionPadre === codigoAccionPadre &&
          subAccion.codigoSubAccion === codigoSubAccion
      );
      return subAcciones !== undefined && subAcciones !== null;
    }

    return modulo !== undefined && modulo !== null;
  }
  //
}
