<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Crear Equipo" @cerrar="handleCerrar">
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
                <FormFieldsContainer titulo="Crear Equipo">
                  <slot name="prependInformacionGeneral" />

                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.tipoeqcodigo.label"
                      v-model="formFields.tipoeqcodigo.value"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      v-model="formFields.nombreEquipo.value"
                      :label="formFields.nombreEquipo.label"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombreCRM.label"
                      v-model="formFields.nombreCRM.value"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.nombreINET.label"
                      v-model="formFields.nombreINET.value"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-autocomplete
                      :label="formFields.clase.label"
                      v-model="formFields.clase.value"
                      :items="optionslist"
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.fechaCrea.label"
                      v-model="formFields.fechaCrea.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.usuarioCrea.label"
                      v-model="formFields.usuarioCrea.value"
                      disabled
                      required
                    />
                  </v-flex>
                  <v-flex xs4 sm4 md4>
                    <v-text-field
                      :label="formFields.estado.label"
                      v-model="formFields.estado.value"
                      disabled
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
export default class VerCrearModal extends Vue {
  @Prop({ default: true }) show: boolean;
  id_equipo: any;
  dictionaryFormErrors: any = {};
  respuesta: any;
  optionslist: any = [
    { text: 'Equipo', value: false },
    { text: 'Periférico', value: true },
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
      accion: 'Crear Equipo',
      visible: true,
      step: 1,
      title: 'Crear Equipo',
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
      'conecta_matriz_producto/crear_equipo'
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
      value: '',
    },
    usuarioModifica: {
      label: 'Usuario Modificador',
      id: '',
      value: '',
    },
    estado: {
      label: 'Estado',
      id: 'Vigente',
      value: 'Vigente',
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
          self.id_equipo = Number(data.data.eqid.LISTA[0].max) + 1;
          self.formFields.tipoeqcodigo.value = String(
            Number(data.data.eqcodigo.LISTA[0].max) + 1
          );
          self.formFields.usuarioCrea.value =
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
