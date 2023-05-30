<template>
  <v-menu
    class="v-menu"
    left
    origin="center center"
    transition="scale-transition"
    :data-testid="`${params.testId ? `${params.testId}__` : ''}MenuItem`"
  >
    <v-btn slot="activator" icon>
      <v-icon color="#526da5">more_vert</v-icon>
    </v-btn>

    <v-list v-show="mostrarMenuAcciones">
      <v-list-tile style="height:40px;" v-if="btnEnviarComando">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.EnviarComando)">
            <v-icon small color="#526da5">send</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.EnviarComando)"
          >{{ btnEnviarComandoText }}</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnVerDetalle">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.VerDetalle)">
            <v-icon small color="#526da5">info</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.VerDetalle)"
          >{{ btnVerDetalleText }}</v-list-tile-title
        >
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import Vue from 'vue';
import {
  EstadoEntidad,
  EstadoAceptarInformacion,
  EstadoCompartirInformacion,
  TipoUsuario,
  TipoRol,
  ServicioProxy,
} from '@/config/enums';
import { actionsEvent } from '@/setup';
import { Funcionalidades } from '@/config/funcionalidades';
import config from '@/config/index';
import { Accion } from '@/config/enums';
import { CodigoAccion } from '../views/base/VariablesPermisos';
import { AxiosVue } from '@/AxiosVue';

export default Vue.extend({
  data: function() {
    return {
      Accion,
      estadoEntidad: EstadoEntidad.Activo,
      enabledDeleteBtn: true,
      enabledEditBtn: true,
      mostrarMenuAcciones: false,
      //botones deben ser variables no props, para cambiar
      //su estado sin necesidad de data computed
      btnVerDetalle: true,
      btnVerDetalleText: 'Ver Detalles de Envíos',
      btnEnviarComando: false,
      btnEnviarComandoText: 'Enviar Comando',
    };
  },
  props: {
    usuario: {
      type: Object,
      default: null,
    },
    funcionalidad: {
      type: Funcionalidades,
      default: null,
    },
    acciones: {
      type: [],
      default: null,
    },
    codigoAccionesMenuItem: {
      type: [],
      default: null,
    },
  },
  methods: {
    handleItemClick(action) {
      actionsEvent.$emit('actionsEvent', {
        funcionalidad: this.params.funcionalidad,
        action,
        id:
          action === Accion.Eliminar &&
          this.estadoEntidad == EstadoEntidad.Eliminado
            ? -1
            : this.params.value,
        cellRendererParams: this.params,
      });
    },
    chequearPermisos() {
      let boolPermisos = false;
      if (this.params.codigoAccionesMenuItem.length > 0) {
        for (let i = 0; i < this.params.codigoAccionesMenuItem.length; i++) {
          const permiso = this.params.codigoAccionesMenuItem[i];

          let accion = this.params.usuario.permisosUsuario.find(
            x =>
              x.moduloCodigo === this.params.funcionalidad &&
              x.accionCodigo === permiso &&
              x.clienteId === config.getClienteSesion()
          );

          // boolean para permisos
          if (accion !== undefined && accion !== null) {
            boolPermisos = true;
          }
          //---
        }

        if (boolPermisos) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );
        if (verDetalle !== undefined && verDetalle !== null) {
          this.btnVerDetalle = true;
        } else {
          this.btnVerDetalle = false;
        }

        const enviarComando = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.EnviarComando &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.btnEnviarComando = true;
        } else {
          this.btnEnviarComando = false;
        }
      }
    },
  },
  beforeMount() {
    this.chequearPermisos();
  },
  mounted() {
    if (this.params.data.estado != undefined) {
      this.estadoEntidad = this.params.data.estado;
      if (this.params.data.estado == EstadoEntidad.Eliminado) {
        this.enabledDeleteBtn = false;
      }
    }

    if (
      this.params.eParentOfValue.baseURI.toString().indexOf('funcionalidad') >
      -1
    ) {
      this.btnEliminar = false;
    }
  },
});
</script>
<style scoped>
.v-menu {
  display: block;
}
</style>
