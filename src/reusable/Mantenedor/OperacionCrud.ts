import Vue from 'vue';
import { Funcionalidades } from '@/config/funcionalidades';
import store from '@/store';
import { Component } from 'vue-property-decorator';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { SubAccion } from '@/views/base/VariablesPermisos';

// @ts-ignore
@Component
export abstract class OperacionCrud extends Vue {
  funcionalidad: Funcionalidades = null;
  abstract pasos: PasosCrud = {};
  subAccionesUsuario: SubAccion[] = [];
  usuario: any = store.state.user;

  constructor() {
    super();
  }

  created() {
    // permisos Módulo
    this.permisosUsuario();
    this.chequearPermisos();
  }

  permisosUsuario(): void {
    this.subAccionesUsuario = [];

    this.usuario.permisosUsuario.flatMap((accion: any) => {
      let permiso =
        accion.moduloCodigo === this.funcionalidad &&
        accion.subAcciones.length > 0;
      if (permiso) {
        this.subAccionesUsuario.push(accion.subAcciones);
      }
    });
  }

  chequearPermisos(): void {
    Object.values(this.pasos).forEach(value => {
      const permisoCheck = this.chequearAccion(value);

      if (!permisoCheck) {
        value.visible = false;
        value.step = 0;
      }
    });

    let count: number = 1;
    let count2: number = -1;
    Object.values(this.pasos).forEach((value, index) => {
      if (value.visible) {
        value.step = count;
        count++;
      } else {
        value.step = count2--;
      }
    });
  }

  chequearAccion(permiso: PermisoAccionVm): boolean {
    let resp: boolean = false;
    if (this.subAccionesUsuario.length > 0) {
      this.subAccionesUsuario.forEach((itemSubAccion: any) => {
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
}
