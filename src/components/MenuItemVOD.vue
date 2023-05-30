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
      <v-list-tile style="height:40px;" v-if="btnVerPdf">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.VerPdf)">
            <v-icon small color="#526da5">{{ btnVerIcon }}</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.VerPdf)"
          >{{ btnVerText }}</v-list-tile-title
        >
      </v-list-tile>
      <v-list-tile style="height:40px;" v-if="btnDejarDeRecibir">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.DejarRecibirInformacion)"
          >
            <v-icon small color="#526da5">block</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.DejarRecibirInformacion)"
          >Dejar de recibir</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnAceptar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.AceptarInformacionCompartida)"
          >
            <v-icon small color="#526da5">done</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.AceptarInformacionCompartida)"
          >Aceptar</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnRechazar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.RechazarInformacionCompartida)"
          >
            <v-icon small color="#526da5">clear</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.RechazarInformacionCompartida)"
          >Rechazar</v-list-tile-title
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

      <v-list-tile
        style="height:40px;"
        v-if="btnEditar"
        :disabled="!enabledEditBtn"
      >
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.Editar)"
            :disabled="!enabledEditBtn"
          >
            <v-icon small color="#526da5">edit</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Editar)"
          >Editar</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile
        style="height:40px;"
        v-if="btnEliminar"
        :disabled="!enabledDeleteBtn"
      >
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.Eliminar)"
            :disabled="!enabledDeleteBtn"
          >
            <v-icon small color="#526da5">delete</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Eliminar)"
          >Eliminar</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnDejarDeCompartir">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn
            small
            icon
            @click="handleItemClick(Accion.NoRecibirInformacion)"
          >
            <v-icon small color="#526da5">block</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.NoRecibirInformacion)"
          >Dejar de compartir</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile
        style="height:40px;"
        v-if="
          btnCancelar &&
            (params.data.estado.toLowerCase() != 'finalizado' &&
              params.data.estado.toLowerCase() != 'cancelado' &&
              params.data.estado.toLowerCase() != 'consolidando')
        "
      >
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.Cancelar)">
            <v-icon small color="#526da5">block</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Cancelar)"
          >Cancelar</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnDesbloquear">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.Desbloquear)">
            <v-icon small color="#526da5">lock</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Desbloquear)"
          >{{ btnDesbloquearText }}</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnVerReferencia">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.VerReferencia)">
            <v-icon small color="#526da5">{{ btnVerReferenciaIcon }}</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.VerReferencia)"
          >{{ btnVerReferenciaText }}</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnDescargar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.Descargar)">
            <v-icon small color="#526da5">cloud_download</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Descargar)"
          >Descargar {{ btnDescargarText }}</v-list-tile-title
        >
      </v-list-tile>

      <v-list-tile style="height:40px;" v-if="btnCambiarContraseña">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="changePassword">
            <v-icon small color="#526da5">key</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;color:rgba(0,0,0,0.7);"
          @click="changePassword"
          >Cambiar Contraseña</v-list-tile-title
        >
      </v-list-tile>
      <v-list-tile style="height:40px;" v-if="btnEnviar">
        <v-list-tile-avatar style="min-width: 35px;">
          <v-btn small icon @click="handleItemClick(Accion.Enviar)">
            <v-icon small color="#526da5">send</v-icon>
          </v-btn>
        </v-list-tile-avatar>
        <v-list-tile-title
          style="cursor:pointer;font-size:13px;;color:rgba(0,0,0,0.7);"
          @click="handleItemClick(Accion.Enviar)"
          >Enviar {{ btnEnviarText }}</v-list-tile-title
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
      btnDejarDeCompartir: false,
      btnDejarDeRecibir: false,
      btnEliminar: true,
      btnEditar: true,
      btnVerDetalle: true,
      btnVerDetalleText: 'Ver Detalle',
      btnAceptar: false,
      btnRechazar: false,
      btnDesbloquear: false,
      btnCancelar: false,
      btnDesbloquearText: 'Bloquear',
      btnDescargar: false,
      btnCambiarContraseña: false,
      axios: null,
      btnEnviar: false,
      btnEnviarText: '',
      btnDescargarText: '',
      btnVerPdf: false,
      btnVerText: 'Ver PDF',
      btnVerIcon: 'picture_as_pdf',
      btnVerReferencia: false,
      btnVerReferenciaIcon: 'receipt_long',
      btnVerReferenciaText: 'Ver Referencia',
    };
  },
  props: {
    usuario: {
      type: Object,
      default: null,
    },
    data: {
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
    changePassword() {
      let url = '';
      let arr = [];
      arr = window.location.pathname.split('/');
      if (arr.length >= 3) {
        url = window.location.origin + '/' + arr[1];
      } else {
        url = window.location.origin;
      }
      const hor = new Date().getHours();
      const min = new Date().getMinutes();
      const dia = new Date().getDate();
      const mes = new Date().getMonth();
      const horStr = hor > 9 ? hor.toString() : '0' + hor.toString();
      const minStr = min > 9 ? min.toString() : '0' + min.toString();
      const diaStr = dia > 9 ? dia.toString() : '0' + dia.toString();
      const mesStr = mes > 9 ? mes.toString() : '0' + mes.toString();
      const anoStr = new Date().getFullYear().toString();
      let model = {
        EncodeIdUsuario: btoa(this.params.data.id.toString()),
        To: this.params.data.email,
        EncodedFechaEnvio: btoa(
          minStr + horStr + diaStr + mesStr + anoStr + this.params.data.email
        ),
        Url: url,
      };
      this.axios = new AxiosVue(ServicioProxy.Auth);
      this.axios.http
        .post(`Email/LinkReestablecerPassword`, model)
        .then(res => {
          actionsEvent.$emit('envioLink', res.data);
        })
        .catch(err => {
          //this.$snotify.error('Ocurrio un error al enviar correo.');
        });
    },
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

        const editarAccion = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.Editar &&
            x.clienteId === config.getClienteSesion()
        );
        if (editarAccion !== undefined && editarAccion !== null) {
          this.btnEditar = true;
        } else {
          this.btnEditar = false;
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

        const Eliminar = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.Eliminar &&
            x.clienteId === config.getClienteSesion()
        );
        if (Eliminar !== undefined && Eliminar !== null) {
          this.btnEliminar = true;
        } else {
          this.btnEliminar = false;
        }
      }
      if (this.params.funcionalidad === Funcionalidades.Clientes) {
        this.btnEliminar = false;
        if (this.btnEditar == false && this.btnVerDetalle == false) {
          this.mostrarMenuAcciones = false;
        }
      }
      if (this.params.funcionalidad === Funcionalidades.VerFacturacion) {
        this.btnVerDetalleText = 'Detalle Documento';
        this.btnDescargarText = 'Todo';
      }

      if (this.params.funcionalidad == Funcionalidades.Importar) {
        this.btnEliminar = false;

        const cancelar = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.Cancelar &&
            x.clienteId === config.getClienteSesion()
        );
        if (cancelar !== undefined && cancelar !== null) {
          if (this.params.data.estadoImportar == 1) {
            this.btnCancelar = true;
          } else {
            this.btnCancelar = false;
          }
        }

        //[Entrega3 - B521] Perfilamiento - Importar
        if (!this.btnVerDetalle && !this.btnCancelar && !this.btnEliminar)
          this.mostrarMenuAcciones = false;
        //---
      }

      const desbloquear = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.Desbloquear &&
          x.clienteId === config.getClienteSesion()
      );
      if (desbloquear !== undefined && desbloquear !== null) {
        if (this.params.funcionalidad === Funcionalidades.UsuariosTransversal) {
          this.btnDesbloquear = true;

          if (this.params.data.estado === EstadoEntidad.Activo) {
            this.btnDesbloquearText = 'Bloquear';
          } else if (
            this.params.data.estado === EstadoEntidad.BloqueadoPorEjecutivo
          ) {
            this.btnDesbloquearText = 'Desbloquear';
          } else {
            this.btnDesbloquear = false;
            if (!this.btnVerDetalle && !this.btnEditar && !this.btnEliminar)
              this.mostrarMenuAcciones = false;
          }
        }

        if (this.params.funcionalidad == Funcionalidades.Usuarios) {
          this.btnDesbloquear = true;
          if (this.params.data.tipo != TipoUsuario.Transversal) {
            if (this.params.data.estado === EstadoEntidad.Activo) {
              this.btnDesbloquearText = 'Bloquear';
            } else if (
              this.params.data.estado === EstadoEntidad.BloqueadoPorEjecutivo
            ) {
              this.btnDesbloquearText = 'Desbloquear';
            } else {
              this.btnDesbloquear = false;
              if (!this.btnVerDetalle && !this.btnEditar && !this.btnEliminar)
                this.mostrarMenuAcciones = false;
            }
          } else {
            this.btnDesbloquear = false;
            if (!this.btnVerDetalle && !this.btnEditar && !this.btnEliminar)
              this.mostrarMenuAcciones = false;
          }
        }
      } else {
        this.btnDesbloquear = false;
      }

      if (this.params.funcionalidad == Funcionalidades.CamarasVOD) {
        this.btnCancelar = false;

        const cancelar = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.Cancelar &&
            x.clienteId === config.getClienteSesion()
        );
        if (cancelar !== undefined && cancelar !== null) {
          this.btnCancelar = true;
        } else {
          this.btnCancelar = false;
        }
      }

      if (this.params.funcionalidad == Funcionalidades.AlertasVigilanti) {
        this.btnEnviar = false;
        const enviar = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.Enviar &&
            x.clienteId === config.getClienteSesion()
        );

        if (enviar !== undefined && enviar !== null) {
          this.btnEnviar = true;
        } else {
          this.btnEnviar = false;
        }
      }
    },
  },
  beforeMount() {
    this.chequearPermisos();
    if (this.params.funcionalidad === Funcionalidades.Vehiculos) {
      if (
        this.params.data.esCompartido !== undefined &&
        this.params.data.esCompartido === true
      ) {
        this.btnEliminar = false;
      }
    }

    //Grilla Historico de Informes
    if (this.params.funcionalidad === Funcionalidades.HistoricoInforme) {
      const descargar = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.Descargar &&
          x.clienteId === config.getClienteSesion()
      );
      if (descargar !== undefined && descargar !== null) {
        this.btnDescargar = true;
      } else {
        this.btnDescargar = false;
      }
    }

    //Funciones Grilla Usuarios (Solo "Ver Detalle" para Usuarios Transversales y de Sesion)
    if (this.params.funcionalidad === Funcionalidades.Usuarios) {
      const verDetalle = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerDetalle &&
          x.clienteId === config.getClienteSesion()
      );
      const cambiarPassword = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.CambiarPassword &&
          x.clienteId === config.getClienteSesion()
      );
      if (cambiarPassword !== undefined && cambiarPassword !== null) {
        this.btnCambiarContraseña = true;
      } else {
        this.btnCambiarContraseña = false;
      }

      if (this.params.data.tipo === TipoUsuario.Transversal) {
        this.btnEliminar = false;
        this.btnEditar = false;

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }

      if (this.params.data.esUsuarioSesion === true) {
        this.btnEliminar = false;
        this.btnEditar = false;
        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }
    //---

    //Funciones Grilla Usuarios Transversales (Solo "Ver Detalle" para Usuario de Sesion)
    if (this.params.funcionalidad === Funcionalidades.UsuariosTransversal) {
      if (this.params.data.esUsuarioSesion === true) {
        this.btnEliminar = false;
        this.btnEditar = false;
        this.btnDesbloquear = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
      const cambiarPassword = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.CambiarPassword &&
          x.clienteId === config.getClienteSesion()
      );
      if (cambiarPassword !== undefined && cambiarPassword !== null) {
        this.btnCambiarContraseña = true;
      } else {
        this.btnCambiarContraseña = false;
      }
    }
    //---

    //Funciones Grilla Usuarios Transversales (Solo "Ver Detalle" para Usuario ADMINTRACK)
    if (this.params.funcionalidad === Funcionalidades.UsuariosTransversal) {
      if (this.params.data.email === 'admintrack@gpschile.com') {
        this.btnEliminar = false;
        this.btnEditar = false;
        this.btnDesbloquear = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }
    //---

    //Funciones Grilla Roles (Solo "Ver Detalle" para Roles Transversales)
    if (this.params.funcionalidad === Funcionalidades.Roles) {
      if (this.params.data.tipo !== TipoRol.Local) {
        this.btnEliminar = false;
        this.btnEditar = false;
      }
    }
    //---

    //745 - Flota/GrupoDeZona - Consultar
    //Funciones Grilla Grupo de Zona (Solo "Ver Detalle" para Grupo de Zonas Base)
    if (this.params.funcionalidad === Funcionalidades.GrupoDeZona) {
      if (this.params.data.estado === EstadoEntidad.Sistema) {
        this.btnEliminar = false;
        this.btnEditar = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }
    //---

    if (this.params.funcionalidad === Funcionalidades.GrupoDeConductores) {
      if (this.params.data.estado === EstadoEntidad.Sistema) {
        this.btnEliminar = false;
        this.btnEditar = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }
    //745 - Flota/GrupoDeZona - Consultar
    //Funciones Grilla Flotas (Solo "Ver Detalle" para Flotas Base)
    if (this.params.funcionalidad === Funcionalidades.Flotas) {
      if (this.params.data.estado === EstadoEntidad.Sistema) {
        this.btnEliminar = false;
        this.btnEditar = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
      //09-2019: Desarrollo Compartir InformaciÃ³n
      if (this.params.data.esFlotaRecibe === true) {
        this.btnEliminar = false;
      }
    }
    //---

    //Grilla Compartir Información - Los item con estado "Compartido en Flota" no tienen Acciones
    if (this.params.funcionalidad === Funcionalidades.CompartirInformacion) {
      const dejarCompartirAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.DejarDeCompartir &&
          x.clienteId === config.getClienteSesion()
      );

      const verDetalleAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerDetalle &&
          x.clienteId === config.getClienteSesion()
      );

      switch (this.params.data.estadoCompartirInformacion) {
        case EstadoCompartirInformacion.PendienteDeAceptacion:
        case EstadoCompartirInformacion.Aceptada:
          if (dejarCompartirAccion !== undefined) {
            this.btnDejarDeCompartir = true;
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (verDetalleAccion !== undefined) {
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (
            dejarCompartirAccion === undefined &&
            verDetalleAccion === undefined
          ) {
            this.mostrarMenuAcciones = false;
          }
          break;
        case EstadoCompartirInformacion.Rechazada:
        case EstadoCompartirInformacion.DejarDeCompartir:
        case EstadoCompartirInformacion.DejarDeRecibir:
          if (verDetalleAccion !== undefined) {
            this.btnEditar = false;
            this.btnEliminar = false;
          } else {
            this.mostrarMenuAcciones = false;
          }
          break;
        case EstadoCompartirInformacion.CompartidoEnFlota:
          this.mostrarMenuAcciones = false;
          break;
      }
    }
    //---

    //Grilla Aceptar Información - Los item con estado "Compartido en Flota" no tienen Acciones
    if (this.params.funcionalidad === Funcionalidades.AceptarInformacion) {
      const aceptarInfoAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.Aceptar &&
          x.clienteId === config.getClienteSesion()
      );

      const rechazarInfoAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.Rechazar &&
          x.clienteId === config.getClienteSesion()
      );

      const dejarRecibirInfoAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.DejarDeRecibir &&
          x.clienteId === config.getClienteSesion()
      );

      const verDetalleAccion = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerDetalle &&
          x.clienteId === config.getClienteSesion()
      );

      switch (this.params.data.estadoCompartirInformacion) {
        case EstadoAceptarInformacion.Pendiente:
          if (aceptarInfoAccion !== undefined) {
            this.btnAceptar = true;
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (rechazarInfoAccion !== undefined) {
            this.btnRechazar = true;
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (verDetalleAccion !== undefined) {
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (
            aceptarInfoAccion === undefined &&
            rechazarInfoAccion === undefined &&
            verDetalleAccion === undefined
          ) {
            this.mostrarMenuAcciones = false;
          }
          break;
        case EstadoAceptarInformacion.Aceptada:
          if (dejarRecibirInfoAccion !== undefined) {
            this.btnDejarDeRecibir = true;
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (verDetalleAccion !== undefined) {
            this.btnEditar = false;
            this.btnEliminar = false;
          }
          if (
            dejarRecibirInfoAccion === undefined &&
            verDetalleAccion === undefined
          ) {
            this.mostrarMenuAcciones = false;
          }
          break;
        case EstadoAceptarInformacion.Rechazada:
        case EstadoAceptarInformacion.DejadaDeCompartirPorElCliente:
        case EstadoAceptarInformacion.DejarDeRecibir:
          if (verDetalleAccion !== undefined) {
            this.btnEditar = false;
            this.btnEliminar = false;
          } else {
            this.mostrarMenuAcciones = false;
          }
          break;
        case EstadoAceptarInformacion.CompartidoEnFlota:
          this.mostrarMenuAcciones = false;
          break;
      }
    }
    //---

    //06-03-2020 - Acciones - Solo "Ver Detalle" para "Consultar"
    if (this.params.funcionalidad === Funcionalidades.Acciones) {
      if (this.params.data.id === CodigoAccion.Consultar) {
        this.btnEliminar = false;
        this.btnEditar = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }

    //---
    //Tipo Mantenimiento base tendra solo ver detalle
    if (this.params.funcionalidad === Funcionalidades.TipoMantenimiento) {
      if (this.params.data.estado === EstadoEntidad.Sistema) {
        this.btnEliminar = false;
        this.btnEditar = false;

        const verDetalle = this.params.usuario.permisosUsuario.find(
          x =>
            x.moduloCodigo === this.params.funcionalidad &&
            x.accionCodigo === CodigoAccion.VerDetalle &&
            x.clienteId === config.getClienteSesion()
        );

        if (verDetalle !== undefined && verDetalle !== null) {
          this.mostrarMenuAcciones = true;
        } else {
          this.mostrarMenuAcciones = false;
        }
      }
    }

    //Enviar
    if (this.params.funcionalidad === Funcionalidades.AlertasVigilanti) {
      const enviar = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.Enviar &&
          x.clienteId === config.getClienteSesion()
      );
      if (enviar !== undefined && enviar !== null) {
        this.btnEnviar = true;
        this.btnEnviarText = 'por Correo';
      } else {
        this.btnEnviar = false;
      }

      const verRef = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerReferencia &&
          x.clienteId === config.getClienteSesion()
      );
      if (verRef !== undefined && verRef !== null) {
        this.btnVerReferencia = true;
        this.btnVerReferenciaIcon = 'receipt_long';
        this.btnVerReferenciaText = 'Ver Referencia';
      } else {
        this.btnVerReferencia = false;
      }
    }
    //Ver PDF VerFacturaciones
    if (this.params.funcionalidad === Funcionalidades.VerFacturacion) {
      const verPDF = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerPdf &&
          x.clienteId === config.getClienteSesion()
      );
      if (verPDF !== undefined && verPDF !== null) {
        this.btnVerPdf = true;
        this.btnVerText = 'Documento PDF';
        this.btnVerIcon = 'receipt';
      } else {
        this.btnVerPdf = false;
      }

      const verRef = this.params.usuario.permisosUsuario.find(
        x =>
          x.moduloCodigo === this.params.funcionalidad &&
          x.accionCodigo === CodigoAccion.VerReferencia &&
          x.clienteId === config.getClienteSesion()
      );
      if (verRef !== undefined && verRef !== null) {
        this.btnVerReferencia = true;
        this.btnVerReferenciaIcon = 'receipt_long';
        this.btnVerReferenciaText = 'Ver Referencia';
      } else {
        this.btnVerReferencia = false;
      }
    }
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
