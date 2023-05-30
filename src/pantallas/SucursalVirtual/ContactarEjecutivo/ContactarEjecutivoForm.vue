<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <FormFieldsContainer titulo="Contactar Ejecutivo">
            <slot name="prependInformacionGeneral" />
            <v-flex xs12 sm6 md6 offset-sm3 offset-md3>
              <v-select
                v-model="formFields.empresa.value"
                :label="formFields.empresa.label"
                :items="listaEmpresas"
                item-text="nombre"
                item-value="id"
              />
            </v-flex>
            <v-flex xs12 sm6 md6 offset-sm3 offset-md3>
              <v-textarea
                :label="formFields.mensaje.label"
                v-model="formFields.mensaje.value"
                :data-vv-name="formFields.mensaje.id"
                :error-messages="errors.collect(formFields.mensaje.id)"
                v-validate="'max:200'"
                :counter="200"
                class="mx-2 white"
                rows="10"
                prepend-icon="mdi-comment"
              ></v-textarea>
            </v-flex>
            <v-flex sm12 md12>
              <div class="text-sm-center">
                <v-btn @click="enviar"> <v-icon>send</v-icon> Enviar </v-btn>
              </div>
            </v-flex>
          </FormFieldsContainer>
          <br />
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import HandleErrors from '@/config/handleErrors'; //
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';

import { OperacionesCrud } from '../../../reusable/Mantenedor/mantenedorUtils';
import {
  Comentario,
  enviarContacto,
  MsResponseData,
} from '@/pantallas/SucursalVirtual/ContactarEjecutivo/enviarContacto';

import {
  ConfigEmpresas,
  fetchEmpresas,
} from '@/pantallas/SucursalVirtual/NuevaSolicitud/fetchConfigInicial';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class ContactarEjecutivoForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  listaEmpresas: ConfigEmpresas[] = [];
  ms_resp: MsResponseData = null;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  //@Prop({ required: false }) mensajeSeleccionado: Mensaje;
  //@Prop({ default: false }) esEditar: boolean;

  /* state */

  formFields: FormFieldDefMap = {
    empresa: {
      label: 'Empresa',
      id: 'id',
      value: '',
    },
    mensaje: {
      label: 'Mensaje',
      id: 'id',
      value: '',
    },
  };

  mounted() {}

  async getEmpresas() {
    this.listaEmpresas = (await this.cargarEmpresas()) || [];
  }
  cargarEmpresas() {
    //this.loadingService.showLoading();
    return fetchEmpresas().catch(error => {
      if (error.message == 'Network Error') {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      } else if (error.response.status != 404) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las empresas',
          { timeout: 3000 }
        );
      }
    });
    //.finally(() => this.loadingService.hideLoading());
  }

  /*@Watch('mensajeSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    if (!this.mensajeSeleccionado) {
      return;
    }
    this.formFields.nombre.value = this.mensajeSeleccionado.titulo;
    this.formFields.mensaje.value = this.mensajeSeleccionado.mensaje;
    this.estado = this.estado;
  }*/

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          empresa: this.formFields.empresa.value,
          mensaje: this.formFields.mensaje.value,
        } as Comentario,
      },
      this
    );
  }

  constructor() {
    super();
    this.getEmpresas();
  }
  created() {
    this.cambio();
  }

  async enviar() {
    this.ms_resp =
      (await this.enviarContacto(
        String(this.formFields.empresa.value),
        String(this.formFields.mensaje.value),
        JSON.parse(window.localStorage.user)['id'].toString()
      )) || null;
    if (this.ms_resp.CODIGO_RESPUESTA == '1') {
      this.formFields.empresa.value = '';
      this.formFields.mensaje.value = '';
      this.$snotify.success(this.ms_resp.MENSAJE_RESPUESTA);
    } else {
      this.$snotify.error('Error: ' + this.ms_resp.MENSAJE_RESPUESTA);
    }
  }

  enviarContacto(empresa: string, mensaje: string, id_user: string) {
    this.loadingService.showLoading();
    let that = this;
    return enviarContacto(empresa, mensaje, id_user)
      .catch(error => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'enviar contacto',
          })
        );
        return null;
      })
      .then(result => {
        return result;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  cambio() {
    //if (this.estado) {
    //this.formFields.estado.value = 1;
    //this.seleccionEstado = 1;
    //this.formFields.estado.label = 'Activo';
    //this.hint = '';
    //} else {
    //this.formFields.estado.value = 0;
    //this.seleccionEstado = 2;
    //this.formFields.estado.label = 'Inactivo';
    //this.hint = 'Al dejar como inactivo, no se podrán realizar asociaciones.';
    //}
    //this.$emit('estadoSwitch', this.estado);
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>
