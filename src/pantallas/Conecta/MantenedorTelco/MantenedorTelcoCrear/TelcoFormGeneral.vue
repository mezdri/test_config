<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
            <v-flex
              sm3
              md3
              align="rigth"
              style="margin-right: -800px;
margin-bottom: -38px;"
            >
              <v-btn
                @click="crear_telco"
                class="icon"
                style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

margin: 0 0 0 auto;"
              >
                <span style="color: white;" class="color-blanco"
                  >Guardar Cambios</span
                >
              </v-btn>
            </v-flex>

            <FormFieldsContainer titulo="General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.id.label"
                  v-model="formFields.id.value"
                  disabled
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.telconame.label"
                  v-model="formFields.telconame.value"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.telcoprefix.label"
                  v-model="formFields.telcoprefix.value"
                  v-validate="'required|validateNumberAndSemicolon'"
                  :error-messages="errors.collect('prefix')"
                  data-vv-name="prefix"
                  type="text"
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.usuario.label"
                  v-model="formFields.usuario.value"
                  disabled
                />
              </v-flex>
              <v-flex xs4 sm4 md4>
                <v-text-field
                  :label="formFields.fecha.label"
                  v-model="formFields.fecha.value"
                  disabled
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { fetchReportesSerie } from '../fetchReporteSerie';
import { Validator } from 'vee-validate';
import moment from 'moment';
import config from '@/config/index';
@Component({
  components: {
    TextField,
    FormFieldsContainer,
  },
})
export default class TelcoFormGeneral extends Vue {
  @Prop({ default: null }) telcoid_crear: any;
  dictionaryFormErrors: any = {};
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  readonly funcionalidad: Funcionalidades = Funcionalidades.MantenedorTelco;

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        prefix: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  private registrarValidadores() {
    const self = this;

    Validator.extend('validateNumberAndSemicolon', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* El campo solo puede incluir números separados por punto y coma'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: /^[0-9;]*$/.test(value),
            data:
              value == true
                ? undefined
                : {
                    message:
                      '* El campo solo puede incluir números separados por punto y coma',
                  },
          });
        });
      },
    });
  }

  formFields: FormFieldDefMap = {
    id: {
      label: 'Telco Id',
      id: this.telcoid_crear,
      value: this.telcoid_crear,
    },
    telconame: {
      label: 'Nombre',
      id: '',
      value: '',
    },
    telcoprefix: {
      label: 'Prefijo',
      id: '',
      value: '',
    },
    usuario: {
      label: 'Usuario Modificador',
      id: JSON.parse(localStorage.getItem('user')).nombre,
      value: JSON.parse(localStorage.getItem('user')).nombre,
    },
    fecha: {
      label: 'Fecha de Modificación',
      id: moment().format('YYYY-MM-DD h:mm:ss'),
      value: moment().format('YYYY-MM-DD h:mm:ss'),
    },
  };
  async crear_telco() {
    console.log(
      this.formFields.id.value,
      this.formFields.telconame.value,
      this.formFields.telcoprefix.value
    );
    let self = this;
    this.loadingService.showLoading();
    if (this.formFields.telconame.value == '') {
      self.$snotify.error('Debe incluir un Nombre para crear el Telco', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    if (this.formFields.telcoprefix.value == '') {
      self.$snotify.error('Debe incluir minimo un prefijo Telco', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    return fetchReportesSerie(
      {
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
        usuariorut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
        clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
        telcoprefix: this.formFields.telcoprefix.value,
        telconame: this.formFields.telconame.value,
        telcoid: this.formFields.id.value,
        bmoduloid: this.funcionalidad,
      },
      'mantenedor_telco/crear_telco'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  mounted() {
    this.initialize();
    this.registrarValidadores();
  }
}
</script>
