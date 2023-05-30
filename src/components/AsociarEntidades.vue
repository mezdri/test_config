<template>
  <v-layout row justify-center>
    <v-dialog v-model="show" persistent max-width="650">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogConfirmacionClose = true">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title
            style="font-size:17px;margin-left: 10px !important"
            >{{ titulo }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form" v-model="validForm" lazy-validation>
            <v-layout row wrap class="light--text">
              <v-flex xs12>
                <span>{{ subtitulo }}</span>
              </v-flex>
              <v-flex xs12>
                <v-autocomplete
                  v-validate="'required'"
                  :error-messages="errors.collect('selectedItem')"
                  data-vv-name="selectedItem"
                  v-model="selectedItem"
                  prepend-icon="person"
                  :items="items"
                  color="primary"
                  :clearable="true"
                  :item-text="nombreCompleto"
                  item-value="id"
                  :label="entidad"
                  no-data-text="Sin resultados"
                  required
                  @change="setCurrentValor"
                ></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-form>
          <br />
          <!--<span>¿Está seguro que desea asociar {{ this.valorSeleccionado }}?</span>-->
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" depressed @click="closeModal(false)"
            ><span style="color: #526da5">Cancelar</span></v-btn
          >
          <v-btn color="primary" :disabled="!validForm" @click="grabar()">{{
            btnAceptarTxt
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      titulo="Confirmación"
      :mensaje="textoConfirmacion"
      v-on:modalConfirmationEmit="asociarItemCallback($event)"
      textoBtnSi="Aceptar"
      textoBtnNo="Cancelar"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    >
    </app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
const { AgGridVue } = require('ag-grid-vue');
import HandleErrors from '@/config/handleErrors';
import { EstadoEntidad, TipoRol, TipoUsuario } from '@/config/enums';
import { CambioEstadoInterface } from '@/interfaces/CambioEstado';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import Confirmation from './Confirmation.vue';
import { Validator } from 'vee-validate';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class AsociarEntidades extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: 'Asociar a' }) titulo!: string;
  @Prop({ default: '' }) subtitulo!: string;
  @Prop({ default: '' }) entidad!: string;
  @Prop({ default: 'Asociar' }) btnAceptarTxt!: string;
  @Prop({ default: [] }) registrosAsociar!: [{}];

  $snotify: any;
  items: any = [];
  validForm: boolean = true;
  selectedItem: any = null;
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  clienteId: number = config.getClienteSesion();
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  axiosCliente: AxiosVue = new AxiosVue(ServicioProxy.Cliente);
  valorSeleccionado: any = null;
  dictionaryFormErrors: any = {};

  readonly rolTransversalController: string = 'RolTransversal';
  readonly perfilTransversalController: string = 'PerfilTransversal';
  readonly clienteController: string = 'cliente';
  readonly perfilController: string = 'perfil';
  readonly rolController: string = 'rol';
  readonly usuarioController: string = 'usuario';
  readonly clienteTransversalController: string = 'ClienteTransversal';

  get textoConfirmacion() {
    return this.registrosAsociar.length > 1
      ? '¿Confirma realizar estas asociaciones?'
      : '¿Confirma realizar esta asociación?';
  }

  mounted() {
    this.initialize();
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        selectedItem: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.items = [];
    this.selectedItem = null;
    this.valorSeleccionado = '';
    this.$validator.reset();
    if (this.show) {
      switch (this.entidad) {
        case 'Usuario':
          this.axios.http
            .get(`${this.usuarioController}/${this.clienteId}/usuariosAsignar`)
            .then(res => {
              //Solo Usuarios Locales
              this.items = res.data.filter(
                (x: any) => x.tipo == TipoUsuario.Local
              );
            })
            .catch(error => {
              this.$snotify.error(error.message);
            });
          break;
        case 'Rol':
          this.axios.http
            .get(this.rolController)
            .then(res => {
              this.items = res.data.filter(
                (x: any) =>
                  x.clienteId === this.clienteId &&
                  x.estado === EstadoEntidad.Activo &&
                  x.tipo === TipoRol.Local
              );
            })
            .catch(error => {
              this.$snotify.error(error.message);
            });
          break;
        case 'Perfil':
          this.axios.http
            .get(this.perfilController)
            .then(res => {
              this.items = res.data.filter(
                (x: any) => x.clienteId === this.clienteId
              );
            })
            .catch(error => {
              this.$snotify.error(error.message);
            });
          break;
        case 'Rol Transversal':
          this.axiosCliente.http
            .get(this.rolTransversalController)
            .then(res => {
              this.items = res.data;
            })
            .catch(error => {
              this.$snotify.error(error.message);
            });
          break;
        case 'Cliente':
          this.axiosCliente.http
            .get(this.clienteController)
            .then(clientes => {
              this.items = clientes.data;
            })
            .catch(error => {
              this.$snotify.error(error.message);
            });
          break;
      }
    }
  }

  nombreCompleto(item: any): string {
    if (this.entidad == 'Usuario') {
      return (
        //item.id +
        //" - " +
        item.nombre + ' ' + item.apellidoPaterno + ' ' + item.apellidoMaterno
      );
    } else if (this.entidad == 'Rol') {
      return item.name;
      //return item.id + " - " + item.name;
    } else if (this.entidad == 'Perfil') {
      return item.nombre;
    } else if (this.entidad === 'Rol Transversal') {
      return `${item.name} ${' - '} ${TipoRol[item.tipo]}`;
    } else if (this.entidad === 'Cliente') {
      return item.nombre;
    }
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociarEntidadesEmit', false);
    this.dialogConfirmacionClose = false;
    this.show = false;
    this.valorSeleccionado = '';
  }

  grabar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        this.dialogConfirmacion = true;
      }
    });
  }

  asociarItemCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      let index = 0;
      switch (this.entidad) {
        case 'Usuario':
          this.registrosAsociar.forEach((item: any) => {
            this.axios.http
              .post(
                `rol/${item.id}/usuario/${
                  this.selectedItem
                }/cliente/${config.getClienteSesion()}`
              )
              .then(res => {
                index = index + 1;
                if (index == this.registrosAsociar.length) {
                  if (index === 1) {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editar')
                    );
                  } else {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
                    );
                  }
                  this.closeModal(false);
                  this.valorSeleccionado = '';
                }
              })
              .catch(error => {
                index = index + 1;
                if (index == this.registrosAsociar.length) {
                  this.closeModal(false);
                  this.valorSeleccionado = '';
                }
              });
          });
          break;
        case 'Rol':
          this.registrosAsociar.forEach((perfil: any) => {
            let model: any = {
              Id: perfil.id,
              Nombre: perfil.nombre,
              Estado: perfil.estado,
              PerfilRoles: [],
            };

            model.PerfilRoles.push({
              fechaFinAsociacion: new Date(
                new Date().getFullYear() + 1,
                10,
                10
              ),
              fechaInicioAsociacion: new Date(),
              id: index,
              nombreRol: 'x',
              perfilId: perfil.id,
              rolId: this.selectedItem,
            });

            this.axios.http
              .put('perfil/' + perfil.id + '/rol', model)
              .then(res => {
                index = index + 1;
                if (index == this.registrosAsociar.length) {
                  if (index === 1) {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editar')
                    );
                  } else {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
                    );
                  }
                  this.closeModal(false);
                  this.valorSeleccionado = '';
                }
              })
              .catch(error => {
                index = index + 1;
                if (index == this.registrosAsociar.length) {
                  this.closeModal(false);
                  this.valorSeleccionado = '';
                }
              });
          });
          break;
        case 'Perfil':
          this.registrosAsociar.forEach((funcionalidad: any) => {
            let model: any = [];
            model.push({
              id: funcionalidad.id,
              nombre: funcionalidad.nombre,
              descripcion: funcionalidad.descripcion,
              estado: funcionalidad.estado,
            });

            this.axios.http
              .post('perfil/' + this.selectedItem + '/funcionalidad', model)
              .then(res => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  if (index === 1) {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editar')
                    );
                  } else {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
                    );
                  }
                  this.closeModal(false);
                }
              })
              .catch(err => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  this.closeModal(false);
                }
              });
          });
          break;
        case 'Rol Transversal':
          this.registrosAsociar.forEach((rol: any) => {
            this.axiosCliente.http
              .post(
                `${this.perfilTransversalController}/${this.selectedItem}/rol/${rol.id}`,
                {}
              )
              .then(res => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  if (index === 1) {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editar')
                    );
                  } else {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
                    );
                  }
                  this.closeModal(false);
                }
              })
              .catch(err => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  this.closeModal(false);
                }
              });
          });
          break;
        case 'Cliente':
          this.registrosAsociar.forEach((rol: any) => {
            this.axiosCliente.http
              .post(
                `${this.clienteTransversalController}/${rol.id}/cliente/${this.selectedItem}`,
                {}
              )
              .then(res => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  if (index === 1) {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editar')
                    );
                  } else {
                    this.$snotify.success(
                      this.$t('mensajes.mensajesAsociacionesExito.editarMasivo')
                    );
                  }
                  this.closeModal(false);
                }
              })
              .catch(err => {
                index += 1;
                if (index == this.registrosAsociar.length) {
                  this.closeModal(false);
                }
              });
          });
          break;
      }
    }
    this.dialogConfirmacionClose = false;
  }

  setCurrentValor() {
    this.valorSeleccionado = '';
    this.items.forEach((item: any) => {
      if (item.id === this.selectedItem) {
        if (this.entidad == 'Usuario') {
          this.valorSeleccionado =
            'el Usuario ' +
            item.nombre +
            ' ' +
            item.apellidoPaterno +
            ' ' +
            item.apellidoMaterno +
            ' al Rol';
        } else if (this.entidad == 'Rol') {
          this.valorSeleccionado = 'el Rol ' + item.name + ' al Perfil';
        } else if (this.entidad == 'Perfil') {
          this.valorSeleccionado = 'el Perfil ' + item.nombre;
        }
      }
    });
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }
}
</script>
