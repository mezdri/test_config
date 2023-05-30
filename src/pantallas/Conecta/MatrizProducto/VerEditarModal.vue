<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Editar Equipo" @cerrar="handleCerrar">
      <div
        style="

letter-spacing: 0.02em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 16px;
;"
      ></div>
      <div class="boton_crear" style="">
        <v-btn
          :disabled="ocultar"
          @click="editar"
          class="icon"
          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;
  
  margin: 0 0 0 auto;margin-top: 13px;
height: 38px;"
        >
          <span style="color: white;" class="color-blanco">Guardar</span>
        </v-btn>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <div align="center">
        <v-flex md10>
          <v-card class="rounded-card">
            <v-form ref="form" lazy-validation class="col-md-12">
              <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
                <FormFieldsContainer titulo="Editar Equipo">
                  <slot name="prependInformacionGeneral" />

                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.tipoeqcodigo.label"
                      v-model="formFields.tipoeqcodigo.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-model="formFields.nombreEquipo.value"
                      :label="formFields.nombreEquipo.label"
                      :disabled="ocultar"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombreCRM.label"
                      v-model="formFields.nombreCRM.value"
                      :disabled="ocultar"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombreINET.label"
                      v-model="formFields.nombreINET.value"
                      :disabled="ocultar"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-autocomplete
                      :label="formFields.clase.label"
                      v-model="formFields.clase.value"
                      :items="optionslist"
                      :disabled="ocultar"
                      required
                    />
                  </v-flex>

                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.fechaModifica.label"
                      v-model="formFields.fechaModifica.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.usuarioModifica.label"
                      v-model="formFields.usuarioModifica.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-autocomplete
                      :label="formFields.estado.label"
                      v-model="formFields.estado.value"
                      :items="optionslist_2"
                      :disabled="ocultar"
                      required
                    />
                  </v-flex>
                </FormFieldsContainer>
              </v-container>
            </v-form>
          </v-card>
        </v-flex>
      </div>
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { ServicioProxy } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { fetchReportesSerie } from './fetchReporteSerie';
import moment from 'moment';
import TextField from '@/reusable/Form/TextField.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import config from '@/config/index';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    TextField,
    FormFieldsContainer,
  },
})
export default class VerEditarModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) codigoEquipo: any;
  ocultar: boolean = false;
  id_equipo: any;
  respuesta: any;
  dictionaryFormErrors: any = {};
  optionslist: any = [
    { text: 'Equipo', value: false },
    { text: 'Periferico', value: true },
  ];

  optionslist_2: any = [
    { text: 'Vigente', value: null },
    { text: 'Baja', value: 1 },
  ];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Editar Equipo',
      visible: true,
      step: 1,
      title: 'Editar Equipo',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  readonly funcionalidad: Funcionalidades = Funcionalidades.EditarVehiculos;

  async editar() {
    this.respuesta = await this.$validator.validateAll();
    let self = this;
    this.loadingService.showLoading();

    return fetchReportesSerie(
      {
        usuarioid_alta: JSON.parse(localStorage.getItem('user')).id,
        usuariorut_alta: JSON.parse(localStorage.getItem('user'))
          .rutClienteDefecto,
        tipoeqid: this.id_equipo,
        tipoeqname: this.formFields.nombreEquipo.value,
        tipoeqname_crm: this.formFields.nombreCRM.value,
        tipoeqname_inet: this.formFields.nombreINET.value,
        tipoeqcodigo: this.formFields.tipoeqcodigo.value,
        tipoeqperiferico: this.formFields.clase.value,
        tipoeqestado: this.formFields.estado.value,
      },
      'conecta_matriz_producto/editar_equipo'
    )
      .then((data: any) => {
        if (this.respuesta == false) {
          self.$snotify.error('EL formulario presenta errores.', {
            timeout: 3000,
          });
          return;
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.handleCerrar();
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

  formFields: FormFieldDefMap = {
    tipoeqcodigo: {
      label: 'Código de Equipo',
      id: '',
      value: '',
    },
    nombreEquipo: {
      label: 'Nombre del Equipo',
      id: '',
      value: '',
    },
    nombreCRM: {
      label: 'Nombre en CRM',
      id: '',
      value: '',
    },
    nombreINET: {
      label: 'Nombre Existencia INET',
      id: '',
      value: '',
    },
    clase: {
      label: 'Clase',
      id: '',
      value: '',
    },
    fechaCrea: {
      label: 'Fecha de Creación',
      id: '',
      value: moment().format('YYYY-MM-DD h:mm:ss'),
    },
    usuarioCrea: {
      label: 'Usuario Creador',
      id: '',
      value: '',
    },
    fechaModifica: {
      label: 'Fecha de Modificación',
      id: '',
      value: moment().format('YYYY-MM-DD h:mm:ss'),
    },
    usuarioModifica: {
      label: 'Usuario Modificador',
      id: '',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: '',
      value: '',
    },
  };

  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { id: JSON.parse(localStorage.getItem('user')).id },
      'conecta_matriz_producto/s_crear_equipo'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.formFields.usuarioModifica.value =
            data.data.usuariocreador.LISTA[0].concat_ws;
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
    this.formFields.tipoeqcodigo.value = this.codigoEquipo.tipoeqcodigo;
    this.formFields.nombreEquipo.value = this.codigoEquipo.tipoeqname;
    this.formFields.nombreCRM.value = this.codigoEquipo.tipoeqname_crm;
    this.formFields.nombreINET.value = this.codigoEquipo.tipoeqname_inet;
    this.id_equipo = this.codigoEquipo.tipoeqid;
    console.log(this.codigoEquipo.tipoeqbaja);
    if (this.codigoEquipo.tipoeqperiferico == 't') {
      this.formFields.clase.value = this.optionslist[1];
    } else {
      this.formFields.clase.value = this.optionslist[0];
    }
    if (this.codigoEquipo.tipoeqbaja == 'f') {
      this.formFields.estado.value = {
        text: 'Vigente',
        value: null,
      };
    } else {
      (this.ocultar = true),
        (this.formFields.estado.value = {
          text: 'Baja',
          value: 1,
        });
    }
    this.getEquipos();
    this.dictionaryFormErrors = {
      custom: {
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        name: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Nombre solo debe contener letras y/o espacios.',
        },
        ubicacion: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        apellidoPaterno: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Paterno solo debe contener letras y/o espacios.',
        },
        apellidoMaterno: {
          max: () => config.errorMensajes.maxLength,
          alpha_spaces: () =>
            '* El campo Apellido Materno solo debe contener letras y/o espacios.',
        },
        email: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        contrasena: {
          required: () => config.errorMensajes.textoRequerido,
          confirmed: () => config.errorMensajes.passNoIguales,
          min: () => 'El campo debe tener al menos 8 caracteres.',
        },
        direccion: {
          max: () => config.errorMensajes.maxLength,
        },
        telefonoFijo: {
          max: () => config.errorMensajes.maxLength,
          numeric: () => 'El campo debe ser unicamente numérico',
        },
        celular: {
          max: () => config.errorMensajes.maxLength,
          regex: () => config.errorMensajes.regex,
        },
        estado: {
          required: () => config.errorMensajes.textoRequerido,
        },
        fechaNacimiento: {
          mayorDeEdad: () => config.errorMensajes.fechaMayoriaEdad,
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrarCrear');
  }
}
</script>
<style></style>
